"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getStorageKind } from "@/lib/store"
import { getSettings } from "@/components/settings-modal"

type SupabaseStatus = "ok" | "fail" | "checking"

const label = (value: boolean) => (value ? "Online" : "Offline")

export function DebugBadge() {
  const [visible, setVisible] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>("checking")
  const [enabled, setEnabled] = useState(false)

  const storage = useMemo(() => (getStorageKind() === "local" ? "Local" : "Memory"), [])

  useEffect(() => {
    const read = () => {
      const settings = getSettings()
      setEnabled(Boolean(settings.debugBadgeEnabled))
    }

    read()
    window.addEventListener("fridge-settings-changed", read)
    window.addEventListener("storage", read)
    return () => {
      window.removeEventListener("fridge-settings-changed", read)
      window.removeEventListener("storage", read)
    }
  }, [])

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const check = async () => {
      setSupabaseStatus("checking")
      try {
        const { error } = await supabase.from("families").select("id", { head: true, count: "exact" }).limit(1)
        if (cancelled) return
        setSupabaseStatus(error ? "fail" : "ok")
      } catch {
        if (cancelled) return
        setSupabaseStatus("fail")
      }
    }

    void check()
    const interval = window.setInterval(check, 15000)
    const onVisible = () => {
      if (document.visibilityState === "visible") void check()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [enabled])

  if (!enabled || !visible) return null

  const supabaseText = supabaseStatus === "ok" ? "OK" : supabaseStatus === "fail" ? "Fail" : "…"
  const supabaseColor =
    supabaseStatus === "ok" ? "bg-green-500/90" : supabaseStatus === "fail" ? "bg-red-500/90" : "bg-gray-500/80"

  return (
    <div className="pointer-events-auto fixed bottom-2 left-2 z-20 rounded-lg bg-black/40 px-2 py-1 text-[10px] text-white backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="rounded px-1 py-0.5 bg-white/10">{label(isOnline)}</span>
        <span className={`rounded px-1 py-0.5 ${supabaseColor}`}>Supabase {supabaseText}</span>
        <span className="rounded px-1 py-0.5 bg-white/10">{storage}</span>
        <button
          className="ml-1 rounded bg-white/10 px-1 py-0.5 hover:bg-white/20"
          onClick={() => setVisible(false)}
          aria-label="Hide debug badge"
          title="Скрыть"
        >
          ×
        </button>
      </div>
    </div>
  )
}

