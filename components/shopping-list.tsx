"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, ShoppingCart, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Product, useFridgeStore } from "@/lib/store"
import { canShowNutritionButton } from "@/constants/productsDatabase"

interface ProductItemProps {
  product: Product
  onMarkBought: (id: string) => void
  onAddNutrition: (name: string) => void
  isLocallyBought: boolean
}

function ProductItem({ product, onMarkBought, onAddNutrition, isLocallyBought }: ProductItemProps) {
  const showFoodDetails = canShowNutritionButton(product.name)
  const daysUntilExpiry = showFoodDetails && product.expiryDate
    ? Math.ceil((new Date(product.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0
  const isExpiringSoon = daysUntilExpiry <= 2
  const isExpired = daysUntilExpiry < 0

  const getExpiryText = () => {
    if (isExpired) return "Просрочено"
    if (daysUntilExpiry === 0) return "Истекает сегодня"
    if (daysUntilExpiry === 1) return "Годен 1 день"
    if (daysUntilExpiry <= 4) return `Годен ${daysUntilExpiry} дня`
    return `Годен ${daysUntilExpiry} дней`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`flex items-center gap-1.5 rounded-lg p-1.5 shadow-sm ${isLocallyBought ? "bg-green-100 ring-1 ring-green-200" : "bg-white"}`}
    >
      <div className="text-sm leading-none">{product.emoji}</div>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-600">
        {product.addedBy}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[10px] font-medium ${isLocallyBought ? "text-green-700" : "text-gray-800"}`}>
          {product.name} — {product.quantity} {product.unit}
        </p>
        {showFoodDetails && (
          <div className="mt-0.5 flex items-center gap-1">
            <Clock className={`h-2 w-2 ${isExpiringSoon || isExpired ? "text-red-500" : "text-gray-400"}`} />
            <Badge
              variant="secondary"
              className={`px-1.5 py-0 text-[9px] ${isExpired ? "bg-gray-100 text-gray-600" : isExpiringSoon ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
            >
              {getExpiryText()}
            </Badge>
          </div>
        )}
      </div>
      {showFoodDetails && (
        <button onClick={() => onAddNutrition(product.name)} className="rounded-md bg-blue-500 px-1.5 py-0.5 text-[9px] font-semibold text-white hover:bg-blue-600">
          БЖУ
        </button>
      )}
      <button
        onClick={() => onMarkBought(product.id)}
        className={`flex h-6 w-6 items-center justify-center rounded-full ${isLocallyBought ? "bg-green-600 text-white" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

interface ShoppingListProps {
  onAddNutrition: (name: string) => void
}

export function ShoppingList({ onAddNutrition }: ShoppingListProps) {
  const { shoppingList, removeFromShopping } = useFridgeStore()
  const [localPurchasedIds, setLocalPurchasedIds] = useState<string[]>([])
  const products = shoppingList

  const markBought = (id: string) => {
    if (localPurchasedIds.includes(id)) return
    setLocalPurchasedIds((prev) => [...prev, id])
    window.setTimeout(() => {
      void removeFromShopping(id)
      setLocalPurchasedIds((prev) => prev.filter((itemId) => itemId !== id))
    }, 320)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Нужно купить</h2>
        {products.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-100 px-1.5 text-xs font-medium text-orange-600">
            {products.length}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto pb-2 pr-1">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-xs text-gray-400">Список покупок пуст</p>
            <p className="mt-1 text-[10px] text-gray-300">Добавьте продукты через поле выше</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  onMarkBought={markBought}
                  onAddNutrition={onAddNutrition}
                  isLocallyBought={localPurchasedIds.includes(product.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
