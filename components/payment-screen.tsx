"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFridgeStore } from "@/lib/store"

export function PaymentScreen() {
  const [promoCode, setPromoCode] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const applyPromoCode = useFridgeStore((s) => s.applyPromoCode)

  const handleApplyPromo = async () => {
    const result = await applyPromoCode(promoCode)
    setMessage(result.message)
    setIsError(!result.ok)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-100 to-cyan-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-center text-xl font-semibold text-gray-800">Оплата подписки</h2>
        <p className="mt-2 text-center text-sm text-gray-500">Введите промокод или оплатите доступ через СБП</p>

        <div className="mt-5 space-y-3">
          <Input
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Ввести промокод"
            className="h-12 rounded-xl"
          />
          <Button onClick={handleApplyPromo} className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
            Активировать промокод
          </Button>
          <Button
            variant="outline"
            onClick={() => window.alert("Оплата временно недоступна")}
            className="h-12 w-full rounded-xl"
          >
            Оплатить через СБП
          </Button>
        </div>

        {message && (
          <p className={`mt-3 text-center text-sm ${isError ? "text-red-500" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </motion.div>
    </div>
  )
}
