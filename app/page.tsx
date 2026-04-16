"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { RefrigeratorIcon, ClipboardList } from "lucide-react"
import { FridgeHeader } from "@/components/fridge-header"
import { ShoppingList } from "@/components/shopping-list"
import { Chat } from "@/components/chat"
import { FloatingButtons } from "@/components/floating-buttons"
import { NameModal } from "@/components/name-modal"
import { HistoryModal } from "@/components/history-modal"
import { JoinScreen } from "@/components/join-screen"
import { NutritionCounter } from "@/components/nutrition-counter"
import { AppErrorBoundary } from "@/components/app-error-boundary"
import { DebugBadge } from "@/components/debug-badge"
import { useFridgeStore } from "@/lib/store"
import { getNutritionForProduct } from "@/constants/productsDatabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart } from "lucide-react"
import { parseProductInput } from "@/lib/parseProductInput"

export default function HomePage() {
  const { userName, setUserName, addToShopping, hasJoined, initialize, isHydrated, isLoading, error, bypassLogin } = useFridgeStore()
  const [mounted, setMounted] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [currentDate, setCurrentDate] = useState("")
  const [newProduct, setNewProduct] = useState("")
  const [selectedNutritionProduct, setSelectedNutritionProduct] = useState<string | null>(null)
  const [nutritionTotals, setNutritionTotals] = useState({ protein: 0, fat: 0, carbs: 0 })

  useEffect(() => {
    setMounted(true)
    // Format current date as DD/MM/YYYY
    const now = new Date()
    const day = now.getDate().toString().padStart(2, "0")
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const year = now.getFullYear()
    setCurrentDate(`${day}/${month}/${year}`)
  }, [])

  useEffect(() => {
    if (mounted) {
      void initialize()
    }
  }, [mounted, initialize])

  useEffect(() => {
    if (mounted && hasJoined && !userName) {
      setShowNameModal(true)
    }
  }, [mounted, userName, hasJoined])

  const handleNameSubmit = async (profile: { name: string; gender: "male" | "female"; avatar: string }) => {
    const success = await setUserName(profile)
    if (success) {
      setShowNameModal(false)
    }
  }

  const handleAddNutrition = (productName: string) => {
    if (selectedNutritionProduct === productName) return
    const nutrition = getNutritionForProduct(productName)
    if (!nutrition) return
    setSelectedNutritionProduct(productName)
    setNutritionTotals(nutrition)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseProductInput(newProduct)
    if (!parsed) return

    await addToShopping({
      name: parsed.displayName,
      emoji: parsed.emoji,
      quantity: parsed.quantity,
      unit: parsed.unit,
    })
    setNewProduct("")
  }

  // Show loading state during hydration
  if (!mounted || !isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-cyan-100/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400">
            <RefrigeratorIcon className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-500">Загрузка...</p>
        </motion.div>
      </div>
    )
  }

  // Show join screen if user hasn't joined a family yet
  if (!hasJoined) {
    return <JoinScreen />
  }

  return (
    <AppErrorBoundary>
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-blue-50 to-cyan-100/50">
      {/* Name Modal */}
      {showNameModal && <NameModal onSubmit={handleNameSubmit} />}

      {/* History Modal */}
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />

      <div className="shrink-0 px-3 pb-1 pt-2">
        <div className="flex items-start justify-between gap-2">
          <NutritionCounter
            protein={nutritionTotals.protein}
            fat={nutritionTotals.fat}
            carbs={nutritionTotals.carbs}
          />
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs text-white shadow-sm transition-colors hover:bg-green-600"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span className="font-medium">История</span>
            </button>
            <p className="text-[11px] text-gray-500">{currentDate}</p>
          </div>
        </div>
      </div>

      <FridgeHeader />

      {error && (
        <div className="mx-3 mb-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <p>{error}</p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => void initialize()} className="rounded-md bg-red-100 px-2 py-1 text-red-800">
              Повторить подключение
            </button>
            <button onClick={bypassLogin} className="rounded-md bg-gray-200 px-2 py-1 text-gray-700">
              Открыть offline-режим
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden px-3">
        <ShoppingList onAddNutrition={handleAddNutrition} />
      </div>

      <div className="relative z-20 shrink-0 px-3 pb-2 pt-1">
        <form onSubmit={handleAddProduct} className="flex gap-2">
          <div className="relative flex-1">
            <ShoppingCart className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder='Например: "5 шт помидор" или "хлеб 2 шт"'
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              className="h-10 rounded-xl border-gray-200 bg-white pl-10 text-sm shadow-sm placeholder:text-gray-400 focus-visible:ring-blue-300"
            />
          </div>
          <Button
            type="submit"
            disabled={!newProduct.trim() || isLoading}
            className="h-10 gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-3 text-sm text-white shadow-md hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        </form>
      </div>

      <FloatingButtons />

      <Chat />
      <DebugBadge />
      </div>
    </AppErrorBoundary>
  )
}
