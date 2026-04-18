"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFridgeStore } from "@/lib/store"
import type { UserProfileSetup } from "@/lib/store"

interface NameModalProps {
  onSubmit: (profile: UserProfileSetup) => void | Promise<void>
}

const MALE_AVATARS = ["🧑‍🚀", "🧔", "🧑‍💻", "🧑‍🔧", "🕺"]
const FEMALE_AVATARS = ["👩‍🚀", "👩‍💻", "👩‍🔧", "💃", "👸"]

export function NameModal({ onSubmit }: NameModalProps) {
  const [name, setName] = useState("")
  const [gender, setGender] = useState<"male" | "female" | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { isLoading } = useFridgeStore()
  const avatars = gender === "male" ? MALE_AVATARS : gender === "female" ? FEMALE_AVATARS : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && gender && avatar) {
      try {
        setErrorMessage(null)
        await onSubmit({ name: name.trim(), gender, avatar })
      } catch (err) {
        console.error("NameModal submit failed", err)
        const message = err instanceof Error ? err.message : "Не удалось сохранить профиль"
        setErrorMessage(message)
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400">
              <span className="text-2xl text-white">&#x1F9CA;</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Семейный холодильник
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Имя, пол и аватар для профиля
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl border-gray-200 text-center text-lg"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={gender === "male" ? "default" : "outline"}
                onClick={() => {
                  setGender("male")
                  setAvatar(MALE_AVATARS[0])
                }}
                className="rounded-xl"
              >
                Муж
              </Button>
              <Button
                type="button"
                variant={gender === "female" ? "default" : "outline"}
                onClick={() => {
                  setGender("female")
                  setAvatar(FEMALE_AVATARS[0])
                }}
                className="rounded-xl"
              >
                Жен
              </Button>
            </div>
            {gender && (
              <div className="grid grid-cols-5 gap-2">
                {avatars.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatar(item)}
                    className={`flex h-11 w-full items-center justify-center rounded-xl text-xl transition ${
                      avatar === item ? "ring-2 ring-cyan-500" : "ring-1 ring-gray-200"
                    }`}
                    style={{
                      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"][index],
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
            <Button
              type="submit"
              disabled={!name.trim() || !gender || !avatar || isLoading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
            >
              {isLoading ? "Сохраняем..." : "Начать"}
            </Button>
            {errorMessage && (
              <p className="text-center text-sm font-medium text-red-600">{errorMessage}</p>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
