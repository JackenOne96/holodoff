"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { getSupabase } from "@/lib/supabase"
import { getProductFromDatabase, getProductIcon } from "@/constants/productsDatabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export const DEFAULT_EXPIRY: Record<string, number> = {
  "молоко": 14,
  "хлеб": 5,
  "яйца": 30,
  "сыр": 21,
  "яблоки": 10,
  "масло": 30,
  "йогурт": 7,
  "курица": 3,
  "рыба": 2,
  "овощи": 7,
  "фрукты": 7,
  "сок": 10,
  "творог": 5,
  "сметана": 7,
  "колбаса": 7,
  "мясо": 3,
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
]

const SYSTEM_MESSAGE_PREFIX = "__system__::"
let familyChannel: RealtimeChannel | null = null
let broadcastChannel: RealtimeChannel | null = null
let activeRealtimeFamilyId: string | null = null
let refreshTimer: ReturnType<typeof setTimeout> | null = null
const memoryStorage = new Map<string, string>()

type FamilySignalType = "alert" | "ok" | "store" | "ack"

export type IncomingFamilySignal = {
  id: string
  type: FamilySignalType
  familyId: string
  senderMemberId: string
  senderName: string
  createdAt: string
}

const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: (name: string) => memoryStorage.get(name) ?? null,
      setItem: (name: string, value: string) => void memoryStorage.set(name, value),
      removeItem: (name: string) => void memoryStorage.delete(name),
    }
  }

  try {
    const probe = "__fridge_probe__"
    window.localStorage.setItem(probe, "1")
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return {
      getItem: (name: string) => memoryStorage.get(name) ?? null,
      setItem: (name: string, value: string) => void memoryStorage.set(name, value),
      removeItem: (name: string) => void memoryStorage.delete(name),
    }
  }
})

let storageKind: "local" | "memory" = "memory"
try {
  const probe = "__fridge_probe_kind__"
  if (typeof window !== "undefined") {
    window.localStorage.setItem(probe, "1")
    window.localStorage.removeItem(probe)
    storageKind = "local"
  }
} catch {
  storageKind = "memory"
}

export const getStorageKind = () => storageKind

type DbFamily = {
  id: string
  invite_code: string
  name: string | null
  trial_ends_at: string | null
  created_at: string
}

type DbFamilyMember = {
  id: string
  family_id: string
  auth_user_id: string | null
  name: string
  gender: string | null
  avatar_letter: string | null
  avatar_icon: string | null
  created_at: string
}

type DbShoppingItem = {
  id: string
  family_id: string
  added_by: string | null
  name: string
  emoji: string | null
  quantity: number | null
  unit: string | null
  expiry_date: string | null
  created_at: string
  purchased: boolean
  purchased_at: string | null
}

type DbChatMessage = {
  id: string
  family_id: string
  sender_id: string | null
  text: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  emoji: string
  quantity: number
  unit: string
  addedDate: string
  expiryDate: string | null
  addedBy: string
  purchased: boolean
}

export interface ChatMessage {
  id: string
  text: string
  sender: string
  senderAvatar: string
  senderId: string | null
  timestamp: string
  isSystem?: boolean
}

export interface FamilyMember {
  id: string
  name: string
  initial: string
  avatar: string
  gender: "male" | "female" | null
  color: string
}

export interface UserProfileSetup {
  name: string
  gender: "male" | "female"
  avatar: string
}

export interface PurchaseHistoryEntry {
  id: string
  name: string
  emoji: string
  purchasedAt: string
}

interface FridgeState {
  isHydrated: boolean
  isLoading: boolean
  error: string | null
  isBypassMode: boolean

  userName: string | null
  currentMemberId: string | null
  setUserName: (profile: UserProfileSetup) => Promise<boolean>

  hasJoined: boolean
  familyId: string | null
  familyName: string
  familyCode: string
  requiresPayment: boolean
  joinFamily: (code: string) => Promise<boolean>
  createFamily: (name: string) => Promise<boolean>
  applyPromoCode: (code: string) => Promise<{ ok: boolean; message: string }>
  bypassLogin: () => void
  initialize: () => Promise<void>
  refreshFamilyData: () => Promise<void>

  familyMembers: FamilyMember[]
  shoppingList: Product[]
  history: PurchaseHistoryEntry[]
  addToShopping: (input: { name: string; emoji?: string; quantity?: number; unit?: string }) => Promise<void>
  removeFromShopping: (id: string) => Promise<void>
  markAllShoppingPurchased: () => Promise<void>
  clearHistory: () => Promise<boolean>
  signOutFromProfile: () => Promise<void>

  messages: ChatMessage[]
  addMessage: (text: string, sender: string, isSystem?: boolean) => Promise<void>

  incomingSignal: IncomingFamilySignal | null
  clearIncomingSignal: () => void
  broadcastSignal: (type: FamilySignalType) => Promise<void>
}

const calculateExpiryDate = (productName: string): string | null => {
  const dictionaryEntry = getProductFromDatabase(productName)
  if (dictionaryEntry && !dictionaryEntry.isFood) {
    return null
  }

  const lowerName = productName.toLowerCase()
  let days = 7

  for (const [key, value] of Object.entries(DEFAULT_EXPIRY)) {
    if (lowerName.includes(key)) {
      days = value
      break
    }
  }

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + days)
  return expiryDate.toISOString()
}

const formatDisplayName = (name: string) =>
  name.trim().charAt(0).toUpperCase() + name.trim().slice(1)

const getInitial = (value: string | null | undefined) => (value?.trim().charAt(0) || "?").toUpperCase()

const mapFamilyMembers = (members: DbFamilyMember[]): FamilyMember[] =>
  members.map((member, index) => ({
    id: member.id,
    name: member.name,
    initial: getInitial(member.avatar_letter || member.name),
    avatar: member.avatar_icon || getInitial(member.avatar_letter || member.name),
    gender: member.gender === "male" || member.gender === "female" ? member.gender : null,
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
  }))

const mapShoppingItems = (items: DbShoppingItem[], membersById: Map<string, DbFamilyMember>): Product[] =>
  items.map((item) => ({
    id: item.id,
    name: item.name,
    emoji: item.emoji || "🛒",
    quantity: item.quantity ?? 1,
    unit: item.unit ?? "шт",
    addedDate: item.created_at,
    expiryDate: item.expiry_date || null,
    addedBy: getInitial(membersById.get(item.added_by || "")?.avatar_letter || membersById.get(item.added_by || "")?.name),
    purchased: item.purchased,
  }))

const mapChatMessages = (messages: DbChatMessage[], membersById: Map<string, DbFamilyMember>): ChatMessage[] =>
  messages.map((message) => {
    const isSystem = message.text.startsWith(SYSTEM_MESSAGE_PREFIX)
    return {
      id: message.id,
      text: isSystem ? message.text.slice(SYSTEM_MESSAGE_PREFIX.length) : message.text,
      sender: isSystem
        ? "Система"
        : getInitial(membersById.get(message.sender_id || "")?.avatar_letter || membersById.get(message.sender_id || "")?.name),
      senderAvatar: isSystem ? "⚠️" : membersById.get(message.sender_id || "")?.avatar_icon || "🙂",
      senderId: message.sender_id,
      timestamp: message.created_at,
      isSystem,
    }
  })

const buildHistory = (items: DbShoppingItem[]): PurchaseHistoryEntry[] =>
  items
    .filter((item) => Boolean(item.purchased_at))
    .map((item) => ({
      id: item.id,
      name: item.name,
      emoji: item.emoji || "📦",
      purchasedAt: item.purchased_at as string,
    }))
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))

const loadFamilyData = async (familyId: string) => {
  const supabase = getSupabase()
  if (!supabase) {
    return { familyMembers: [], shoppingList: [], history: [], messages: [] }
  }
  const since = new Date()
  since.setDate(since.getDate() - 3)
  const sinceIso = since.toISOString()

  const [{ data: members, error: membersError }, { data: shoppingItems, error: shoppingError }, { data: messages, error: messagesError }] =
    await Promise.all([
      supabase.from("family_members").select("*").eq("family_id", familyId).order("created_at", { ascending: true }),
      supabase.from("shopping_items").select("*").eq("family_id", familyId).order("created_at", { ascending: true }),
      supabase.from("chat_messages").select("*").eq("family_id", familyId).order("created_at", { ascending: true }),
    ])

  if (membersError) throw membersError
  if (shoppingError) throw shoppingError
  if (messagesError) throw messagesError

  const typedMembers = (members || []) as DbFamilyMember[]
  const typedShoppingItems = (shoppingItems || []) as DbShoppingItem[]
  const typedMessages = (messages || []) as DbChatMessage[]

  const membersById = new Map(typedMembers.map((member) => [member.id, member]))

  return {
    familyMembers: mapFamilyMembers(typedMembers),
    shoppingList: mapShoppingItems(typedShoppingItems.filter((item) => !item.purchased), membersById),
    history: buildHistory(
      typedShoppingItems.filter((item) => item.purchased && item.purchased_at !== null && item.purchased_at >= sinceIso)
    ),
    messages: mapChatMessages(typedMessages, membersById),
  }
}

const stopRealtime = async () => {
  if (familyChannel) {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.removeChannel(familyChannel)
    }
    familyChannel = null
  }

  if (broadcastChannel) {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.removeChannel(broadcastChannel)
    }
    broadcastChannel = null
  }
  activeRealtimeFamilyId = null
}

const scheduleRefresh = (refresh: () => Promise<void>) => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }

  refreshTimer = setTimeout(() => {
    void refresh()
  }, 150)
}

const getFamilySignalEvent = (familyId: string) => `signal:${familyId}`
const FAMILY_MEMBER_LIMIT = 4
const PROMO_CODE = "HolodAll2026"

const generateInviteCode = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()
    .padEnd(6, "0")
    .slice(0, 6)

const startRealtime = async (familyId: string, refresh: () => Promise<void>) => {
  if (activeRealtimeFamilyId === familyId && familyChannel && broadcastChannel) {
    return
  }

  await stopRealtime()

  const supabase = getSupabase()
  if (!supabase) return

  familyChannel = supabase
    .channel(`family-realtime-${familyId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "family_members", filter: `family_id=eq.${familyId}` },
      () => scheduleRefresh(refresh)
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shopping_items", filter: `family_id=eq.${familyId}` },
      () => scheduleRefresh(refresh)
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_messages", filter: `family_id=eq.${familyId}` },
      () => scheduleRefresh(refresh)
    )
    .subscribe()

  // Broadcast channel for button "signals" (Внимание / Всё купил / В магазине)
  broadcastChannel = supabase
    .channel("family_channel", {
      config: {
        broadcast: { self: false },
      },
    })
    .on("broadcast", { event: getFamilySignalEvent(familyId) }, (payload) => {
      const data = payload.payload as Partial<IncomingFamilySignal> | undefined
      const state = useFridgeStore.getState()
      if (!data || !data.familyId) return
      if (data.senderMemberId && state.currentMemberId && data.senderMemberId === state.currentMemberId) return
      if (data.familyId !== state.familyId) return

      set({
        incomingSignal: {
          id: data.id || `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: (data.type as FamilySignalType) || "alert",
          familyId: data.familyId,
          senderMemberId: data.senderMemberId || "unknown",
          senderName: data.senderName || "Кто-то",
          createdAt: data.createdAt || new Date().toISOString(),
        },
      })
    })
    .subscribe()

  activeRealtimeFamilyId = familyId
}

export const useFridgeStore = create<FridgeState>()(
  persist(
    (set, get) => ({
      isHydrated: false,
      isLoading: false,
      error: null,
      isBypassMode: false,

      userName: null,
      currentMemberId: null,
      familyId: null,
      familyName: "",
      familyCode: "",
      requiresPayment: false,
      hasJoined: false,

      familyMembers: [],
      shoppingList: [],
      history: [],
      messages: [],

      incomingSignal: null,
      clearIncomingSignal: () => set({ incomingSignal: null }),
      broadcastSignal: async (type: FamilySignalType) => {
        const supabase = getSupabase()
        const { familyId, currentMemberId, userName, isBypassMode } = get()
        if (isBypassMode) return
        if (!supabase || !familyId || !currentMemberId) return

        try {
          if (!broadcastChannel) {
            await startRealtime(familyId, get().refreshFamilyData)
          }
          await broadcastChannel?.send({
            type: "broadcast",
            event: getFamilySignalEvent(familyId),
            payload: {
              id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              type,
              familyId,
              senderMemberId: currentMemberId,
              senderName: userName || "Кто-то",
              createdAt: new Date().toISOString(),
            } satisfies IncomingFamilySignal,
          })
        } catch (err) {
          console.error("Failed to broadcast signal", err)
        }
      },
      bypassLogin: () => {
        set({
          isBypassMode: true,
          hasJoined: true,
          userName: "Тест",
          currentMemberId: "dev-member",
          familyId: null,
          familyName: "Dev family",
          familyCode: "DEV123",
          requiresPayment: false,
          familyMembers: [
            {
              id: "dev-member",
              name: "Тест",
              initial: "Т",
              avatar: "🙂",
              gender: null,
              color: AVATAR_COLORS[0],
            },
          ],
          shoppingList: [],
          history: [],
          messages: [],
          error: null,
          isLoading: false,
          isHydrated: true,
        })
      },

      initialize: async () => {
        const { familyId, hasJoined, isBypassMode } = get()
        if (isBypassMode) {
          await stopRealtime()
          set({ isHydrated: true, isLoading: false, error: null })
          return
        }

        const supabase = getSupabase()
        if (!supabase) {
          await stopRealtime()
          set({ isHydrated: true })
          return
        }

        if (!familyId || !hasJoined) {
          try {
            const { data: sessionData } = await supabase.auth.getSession()
            const user = sessionData.session?.user
            if (!user) {
              await stopRealtime()
              set({ isHydrated: true })
              return
            }

            const { data: memberData } = await supabase
              .from("family_members")
              .select("id, family_id")
              .eq("auth_user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()

            if (!memberData) {
              await stopRealtime()
              set({ isHydrated: true })
              return
            }

            const freshData = await loadFamilyData(memberData.family_id)
            const { data: familyData } = await supabase.from("families").select("*").eq("id", memberData.family_id).single()
            const family = familyData as DbFamily | null
            const currentMember = freshData.familyMembers.find((m) => m.id === memberData.id)

            await startRealtime(memberData.family_id, get().refreshFamilyData)
            set({
              ...freshData,
              familyId: memberData.family_id,
              familyCode: family?.invite_code || "",
              familyName: family?.name || "Семейная группа",
              currentMemberId: memberData.id,
              userName: currentMember?.name || user.email?.split("@")[0] || "Пользователь",
              hasJoined: true,
              requiresPayment: false,
              isHydrated: true,
              isLoading: false,
              error: null,
            })
            return
          } catch {
            await stopRealtime()
            set({ isHydrated: true })
            return
          }
        }

        set({ isLoading: true, error: null })
        try {
          const freshData = await loadFamilyData(familyId)
          const { data: familyData } = await supabase.from("families").select("name,invite_code").eq("id", familyId).single()
          await startRealtime(familyId, get().refreshFamilyData)
          set({
            ...freshData,
            familyName: familyData?.name || get().familyName || "Семейная группа",
            familyCode: familyData?.invite_code || get().familyCode,
            isLoading: false,
            isHydrated: true,
          })
        } catch (error) {
          set({
            isLoading: false,
            isHydrated: true,
            error: error instanceof Error ? error.message : "Не удалось загрузить данные семьи",
          })
        }
      },

      refreshFamilyData: async () => {
        const { familyId, isBypassMode } = get()
        if (isBypassMode) return
        if (!familyId) return

        set({ isLoading: true, error: null })
        try {
          const freshData = await loadFamilyData(familyId)
          set({ ...freshData, isLoading: false })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Не удалось обновить данные семьи",
          })
        }
      },

      joinFamily: async (code: string) => {
        const supabase = getSupabase()
        if (!supabase) {
          set({ isLoading: false, error: "Supabase env is not configured" })
          return false
        }
        const normalizedCode = code.trim().toUpperCase()
        if (normalizedCode === "123456") {
          get().bypassLogin()
          return true
        }

        set({ isLoading: true, error: null })

        const { data, error } = await supabase
          .from("families")
          .select("*")
          .eq("invite_code", normalizedCode)
          .maybeSingle()

        if (error || !data) {
          set({
            isLoading: false,
            error: error?.message || "Семья с таким кодом не найдена",
          })
          return false
        }

        const family = data as DbFamily
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user
        if (!user) {
          set({ isLoading: false, error: "Сначала войдите в аккаунт" })
          return false
        }
        const { count: membersCount, error: membersCountError } = await supabase
          .from("family_members")
          .select("*", { count: "exact", head: true })
          .eq("family_id", family.id)

        if (membersCountError) {
          set({ isLoading: false, error: membersCountError.message })
          return false
        }

        if ((membersCount ?? 0) >= FAMILY_MEMBER_LIMIT) {
          set({
            isLoading: false,
            error: `Достигнут лимит участников (${FAMILY_MEMBER_LIMIT} человека)`,
          })
          return false
        }

        const { data: existingMemberByAuth } = await supabase
          .from("family_members")
          .select("id")
          .eq("family_id", family.id)
          .eq("auth_user_id", user.id)
          .maybeSingle()

        let memberId = existingMemberByAuth?.id || null
        let memberName = formatDisplayName(user.user_metadata?.name || user.email?.split("@")[0] || "Участник")
        if (!memberId) {
          const { data: insertedMember, error: insertMemberError } = await supabase
            .from("family_members")
            .insert({
              family_id: family.id,
              auth_user_id: user.id,
              name: memberName,
              avatar_icon: "🙂",
              gender: null,
            })
            .select("id,name")
            .single()

          if (insertMemberError || !insertedMember) {
            set({ isLoading: false, error: insertMemberError?.message || "Не удалось добавить участника" })
            return false
          }
          memberId = insertedMember.id
          memberName = insertedMember.name
        }

        try {
          const freshData = await loadFamilyData(family.id)
          await startRealtime(family.id, get().refreshFamilyData)
          set({
            ...freshData,
            familyId: family.id,
            familyName: family.name || "Семейная группа",
            familyCode: family.invite_code,
            hasJoined: true,
            currentMemberId: memberId,
            userName: memberName,
            requiresPayment: false,
            isLoading: false,
            error: null,
          })
          return true
        } catch (loadError) {
          set({
            isLoading: false,
            error: loadError instanceof Error ? loadError.message : "Не удалось загрузить данные семьи",
          })
          return false
        }
      },

      createFamily: async (name: string) => {
        const supabase = getSupabase()
        if (!supabase) return false
        const familyName = name.trim()
        if (!familyName) {
          set({ error: "Введите название группы" })
          return false
        }

        set({ isLoading: true, error: null })
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user
        if (!user) {
          set({ isLoading: false, error: "Сначала войдите в аккаунт" })
          return false
        }

        const inviteCode = generateInviteCode()
        const { data: createdFamily, error: familyError } = await supabase
          .from("families")
          .insert({
            invite_code: inviteCode,
            name: familyName,
            created_by: user.id,
          })
          .select("*")
          .single()

        if (familyError || !createdFamily) {
          set({ isLoading: false, error: familyError?.message || "Не удалось создать группу" })
          return false
        }

        const defaultName = formatDisplayName(user.user_metadata?.name || user.email?.split("@")[0] || "Создатель")
        const { data: createdMember, error: memberError } = await supabase
          .from("family_members")
          .insert({
            family_id: createdFamily.id,
            auth_user_id: user.id,
            name: defaultName,
            avatar_icon: "🙂",
            gender: null,
          })
          .select("*")
          .single()

        if (memberError || !createdMember) {
          set({ isLoading: false, error: memberError?.message || "Не удалось добавить участника в группу" })
          return false
        }

        const freshData = await loadFamilyData(createdFamily.id)
        await startRealtime(createdFamily.id, get().refreshFamilyData)
        set({
          ...freshData,
          familyId: createdFamily.id,
          familyName: createdFamily.name || familyName,
          familyCode: createdFamily.invite_code,
          hasJoined: true,
          currentMemberId: createdMember.id,
          userName: createdMember.name,
          requiresPayment: true,
          isLoading: false,
          error: null,
        })
        return true
      },

      applyPromoCode: async (code: string) => {
        const supabase = getSupabase()
        const { familyId } = get()
        if (!supabase || !familyId) return { ok: false, message: "Семья не найдена" }
        if (code.trim() !== PROMO_CODE) return { ok: false, message: "Неверный промокод" }

        const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        const { error } = await supabase.from("families").update({ trial_ends_at: trialEndsAt }).eq("id", familyId)
        if (error) return { ok: false, message: error.message }
        set({ requiresPayment: false })
        return { ok: true, message: "Пробный период активирован на 3 дня" }
      },

      setUserName: async (profile: UserProfileSetup) => {
        const supabase = getSupabase()
        const { familyId, familyMembers, isBypassMode } = get()
        const trimmedName = formatDisplayName(profile.name)
        if (isBypassMode) {
          set({
            userName: trimmedName,
            familyMembers: [
              {
                id: "dev-member",
                name: trimmedName,
                initial: getInitial(trimmedName),
                avatar: profile.avatar,
                gender: profile.gender,
                color: AVATAR_COLORS[0],
              },
            ],
            currentMemberId: "dev-member",
          })
          return true
        }

        if (!familyId) return false
        if (!supabase) return false
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user
        if (!user) {
          set({ isLoading: false, error: "Сначала войдите в аккаунт" })
          return false
        }

        set({ isLoading: true, error: null })

        const { count: membersCount, error: membersCountError } = await supabase
          .from("family_members")
          .select("*", { count: "exact", head: true })
          .eq("family_id", familyId)

        if (membersCountError) {
          set({
            isLoading: false,
            error: membersCountError.message,
          })
          return false
        }

        if ((membersCount ?? 0) >= FAMILY_MEMBER_LIMIT) {
          set({
            isLoading: false,
            error: `Достигнут лимит участников (${FAMILY_MEMBER_LIMIT} человека)`,
          })
          return false
        }

        const existingMember = familyMembers.find((member) => member.name.toLowerCase() === trimmedName.toLowerCase())

        if (existingMember) {
          set({
            userName: existingMember.name,
            currentMemberId: existingMember.id,
            isLoading: false,
          })
          return true
        }

        const { data, error } = await supabase
          .from("family_members")
          .insert({
            family_id: familyId,
            auth_user_id: user.id,
            name: trimmedName,
            gender: profile.gender,
            avatar_icon: profile.avatar,
          })
          .select("*")
          .single()

        if (error || !data) {
          set({
            isLoading: false,
            error: error?.message || "Не удалось сохранить имя участника",
          })
          return false
        }

        const createdMember = data as DbFamilyMember
        await get().refreshFamilyData()
        set({
          userName: createdMember.name,
          currentMemberId: createdMember.id,
          isLoading: false,
          error: null,
        })
        return true
      },

      addToShopping: async (input: { name: string; emoji?: string; quantity?: number; unit?: string }) => {
        const supabase = getSupabase()
        const { familyId, currentMemberId, isBypassMode } = get()
        const desiredQuantity = input.quantity ?? 1
        const desiredUnit = input.unit ?? "шт"
        if (isBypassMode) {
          const normalizedName = formatDisplayName(input.name)
          const currentUserInitial = getInitial(get().userName || "Т")
          const existing = get().shoppingList.find((p) => p.name.toLowerCase() === normalizedName.toLowerCase() && p.unit === desiredUnit)
          if (existing) {
            set((state) => ({
              shoppingList: state.shoppingList.map((p) =>
                p.id === existing.id ? { ...p, quantity: p.quantity + desiredQuantity } : p
              ),
            }))
            return
          }
          set((state) => ({
            shoppingList: [
              ...state.shoppingList,
              {
                id: `dev-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: normalizedName,
                emoji: input.emoji || getProductIcon(normalizedName),
                quantity: desiredQuantity,
                unit: desiredUnit,
                addedDate: new Date().toISOString(),
                expiryDate: calculateExpiryDate(normalizedName),
                addedBy: currentUserInitial,
                purchased: false,
              },
            ],
          }))
          return
        }

        if (!familyId || !currentMemberId) return
        if (!supabase) return

        const normalizedName = formatDisplayName(input.name)
        const existing = get().shoppingList.find((p) => p.name.toLowerCase() === normalizedName.toLowerCase() && p.unit === desiredUnit)
        if (existing) {
          const { error } = await supabase
            .from("shopping_items")
            .update({ quantity: existing.quantity + desiredQuantity, emoji: input.emoji || existing.emoji })
            .eq("id", existing.id)

          if (error) {
            set({ error: error.message })
            return
          }
          await get().refreshFamilyData()
          return
        }

        const { error } = await supabase.from("shopping_items").insert({
          family_id: familyId,
          added_by: currentMemberId,
          name: normalizedName,
          emoji: input.emoji || getProductIcon(normalizedName),
          quantity: desiredQuantity,
          unit: desiredUnit,
          expiry_date: calculateExpiryDate(normalizedName),
          purchased: false,
        })

        if (error) {
          set({ error: error.message })
          return
        }

        await get().refreshFamilyData()
      },

      removeFromShopping: async (id: string) => {
        const supabase = getSupabase()
        if (get().isBypassMode) {
          set((state) => {
            const item = state.shoppingList.find((product) => product.id === id)
            if (!item) return state

            const purchasedAt = new Date().toISOString()
            const nextHistory: PurchaseHistoryEntry[] = [
              { id: `dev-history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: item.name, emoji: item.emoji, purchasedAt },
              ...state.history,
            ]

            return {
              shoppingList: state.shoppingList.filter((product) => product.id !== id),
              history: nextHistory,
            }
          })
          return
        }

        if (!supabase) return

        const { error } = await supabase
          .from("shopping_items")
          .update({ purchased: true, purchased_at: new Date().toISOString() })
          .eq("id", id)

        if (error) {
          set({ error: error.message })
          return
        }

        await get().refreshFamilyData()
      },

      markAllShoppingPurchased: async () => {
        const supabase = getSupabase()
        const { shoppingList, isBypassMode, familyId } = get()
        if (shoppingList.length === 0) return

        if (isBypassMode) {
          const purchasedAt = new Date().toISOString()
          set((state) => {
            const entries: PurchaseHistoryEntry[] = state.shoppingList.map((item) => ({
              id: `dev-history-${Date.now()}-${item.id}-${Math.random().toString(36).slice(2, 8)}`,
              name: item.name,
              emoji: item.emoji,
              purchasedAt,
            }))
            return {
              shoppingList: [],
              history: [...entries, ...state.history],
            }
          })
          return
        }

        if (!familyId) return
        if (!supabase) return

        const ids = shoppingList.map((p) => p.id)
        const { error } = await supabase
          .from("shopping_items")
          .update({ purchased: true, purchased_at: new Date().toISOString() })
          .in("id", ids)
          .eq("family_id", familyId)
          .eq("purchased", false)

        if (error) {
          set({ error: error.message })
          return
        }

        await get().refreshFamilyData()
      },

      signOutFromProfile: async () => {
        await stopRealtime()
        try {
          const supabase = getSupabase()
          if (supabase) {
            await supabase.auth.signOut()
          }
        } catch {
          // session may be absent
        }
        set({
          isLoading: false,
          error: null,
          isBypassMode: false,
          userName: null,
          currentMemberId: null,
          hasJoined: false,
          familyId: null,
          familyName: "",
          familyCode: "",
          requiresPayment: false,
          familyMembers: [],
          shoppingList: [],
          history: [],
          messages: [],
        })
      },

      clearHistory: async () => {
        const supabase = getSupabase()
        const { familyId, isBypassMode } = get()
        if (isBypassMode) {
          set({ history: [] })
          return true
        }
        if (!familyId) return false
        if (!supabase) return false

        set({ isLoading: true, error: null })
        const { error } = await supabase
          .from("shopping_items")
          .delete()
          .eq("family_id", familyId)
          .eq("purchased", true)

        if (error) {
          set({ isLoading: false, error: error.message })
          return false
        }

        await get().refreshFamilyData()
        set({ isLoading: false })
        return true
      },

      addMessage: async (text: string, _sender: string, isSystem = false) => {
        const supabase = getSupabase()
        const { familyId, currentMemberId, isBypassMode, userName } = get()
        if (isBypassMode) {
          set((state) => ({
            messages: [
              ...state.messages,
              {
                id: `dev-msg-${Date.now()}`,
                text,
                sender: isSystem ? "Система" : getInitial(userName || "Т"),
                senderAvatar: isSystem ? "⚠️" : "🙂",
                senderId: isSystem ? null : currentMemberId || "dev-member",
                timestamp: new Date().toISOString(),
                isSystem,
              },
            ],
          }))
          return
        }

        if (!familyId || !currentMemberId) return
        if (!supabase) return

        const payloadText = isSystem ? `${SYSTEM_MESSAGE_PREFIX}${text}` : text

        const { error } = await supabase.from("chat_messages").insert({
          family_id: familyId,
          sender_id: currentMemberId,
          text: payloadText,
        })

        if (error) {
          set({ error: error.message })
          return
        }

        await get().refreshFamilyData()
      },
    }),
    {
      name: "family-fridge-storage",
      storage: safeStorage,
      partialize: (state) => ({
        isBypassMode: state.isBypassMode,
        userName: state.userName,
        currentMemberId: state.currentMemberId,
        familyId: state.familyId,
        familyName: state.familyName,
        familyCode: state.familyCode,
        requiresPayment: state.requiresPayment,
        hasJoined: state.hasJoined,
      }),
    }
  )
)
