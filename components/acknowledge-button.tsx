"use client"

import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { useFridgeStore } from "@/lib/store"

export function AcknowledgeButton() {
  const { userName, broadcastSignal, addMessage } = useFridgeStore()

  const handleAcknowledge = async () => {
    const initial = (userName || "Я").charAt(0).toUpperCase()
    await broadcastSignal("ack")
    await addMessage(`${initial} ознакомился(ась) с обновлениями списка`, "Система", true)
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={handleAcknowledge}
      className="ml-auto flex h-9 items-center gap-1.5 rounded-xl bg-gray-500 px-3 text-xs font-semibold text-white shadow-md hover:bg-gray-600 sm:h-10 sm:text-sm"
      title="Ознакомился"
    >
      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span>Ознакомился</span>
    </motion.button>
  )
}
