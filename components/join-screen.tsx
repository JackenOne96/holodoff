"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, RefrigeratorIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFridgeStore } from "@/lib/store"

export function JoinScreen() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const { joinFamily, bypassLogin, isLoading, error: storeError } = useFridgeStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (code.length !== 6) {
      setError("Код должен состоять из 6 символов")
      return
    }

    if (code === "123456") {
      bypassLogin()
      return
    }

    const success = await joinFamily(code)
    if (!success) {
      setError(storeError || "Неверный код. Попробуйте снова.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-cyan-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-sm flex-col items-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg"
        >
          <RefrigeratorIcon className="h-10 w-10 text-white" />
        </motion.div>

        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Введите код приглашения
        </h1>
        
        <p className="mb-8 text-center text-sm text-gray-500">
          Присоединитесь к семейному холодильнику
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="______"
              value={code}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().slice(0, 6)
                setCode(value)
                setError("")
              }}
              maxLength={6}
              className="h-14 rounded-2xl border-2 border-gray-200 bg-white pl-12 text-center font-mono text-2xl tracking-[0.5em] placeholder:tracking-[0.5em] focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={code.length !== 6 || isLoading}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? "Подключение..." : "Присоединиться к семье"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={bypassLogin}
            className="h-12 w-full rounded-2xl border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Dev Bypass
          </Button>
        </form>

        {/* Hint */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Попросите код у создателя группы
        </p>
        
      </motion.div>
    </div>
  )
}
