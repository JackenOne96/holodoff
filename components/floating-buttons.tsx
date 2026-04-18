"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Store, CheckCheck, Check } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFridgeStore } from "@/lib/store"
import { getSettings } from "./settings-modal"

export function FloatingButtons() {
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [inStoreMode, setInStoreMode] = useState(false)
  const { addMessage, userName, markAllShoppingPurchased, broadcastSignal } = useFridgeStore()

  const playSound = (type: "alert" | "ok" | "store") => {
    const settings = getSettings()
    if (!settings.notificationsEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const volume = (settings.volume / 100) * 0.3

      switch (type) {
        case "alert":
          oscillator.type = "sawtooth"
          oscillator.frequency.setValueAtTime(2200, audioContext.currentTime)
          gainNode.gain.setValueAtTime(Math.min(1, volume * 1.2), audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.12)
          break
        case "ok":
          oscillator.frequency.value = 1200
          oscillator.type = "sine"
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.2)
          break
        case "store":
          oscillator.frequency.value = 1000
          oscillator.type = "sine"
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.3)
          break
      }
    } catch {
      // Audio not supported
    }
  }

  const vibrate = (pattern: number[]) => {
    const settings = getSettings()
    if (!settings.notificationsEnabled) return
    if (navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }

  const pushNotify = async (title: string, body: string) => {
    const settings = getSettings()
    if (!settings.notificationsEnabled || typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission === "default") {
      await Notification.requestPermission()
    }
    if (Notification.permission === "granted") {
      new Notification(title, { body })
    }
  }

  const initial = (userName || "Я").charAt(0).toUpperCase()

  const handleAlert = async () => {
    setIsShaking(true)
    vibrate([200, 100, 200])
    playSound("alert")
    await broadcastSignal("alert")
    await pushNotify("ХолодOFF: Внимание", "Кто-то отправил срочное уведомление семье")
    await addMessage(`${initial} просит срочно заглянуть в список!`, "Система", true)

    setTimeout(() => {
      setIsShaking(false)
      setDialogMessage("Срочный сигнал отправлен!")
      setShowDialog(true)
    }, 500)
  }

  const handleOk = async () => {
    vibrate([100])
    playSound("ok")
    await markAllShoppingPurchased()
    await broadcastSignal("ok")
    await pushNotify("ХолодOFF: Всё купил", "Покупки подтверждены")
    await addMessage(`${initial} подтвердил(а) покупку`, "Система", true)
    setDialogMessage("Подтверждение отправлено!")
    setShowDialog(true)
  }

  const toggleStoreMode = async () => {
    const newMode = !inStoreMode
    setInStoreMode(newMode)

    if (newMode) {
      vibrate([100, 50, 100])
      playSound("store")
      await broadcastSignal("store")
      await pushNotify("ХолодOFF: В магазине", "Пользователь сейчас в магазине")
      await addMessage(`${initial} сейчас в магазине! Пишите, что нужно купить.`, "Система", true)
      setDialogMessage("Все члены семьи уведомлены!")
      setShowDialog(true)
    }
  }

  const btnClass =
    "flex w-full min-h-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[9px] font-semibold leading-tight text-white shadow-md sm:text-[10px]"

  return (
    <>
      {isShaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.1, 0],
            x: [0, -5, 5, -5, 5, 0],
          }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 z-40 bg-red-500"
        />
      )}

      <div className="flex h-full min-h-0 w-full max-w-full flex-col gap-1.5 overflow-hidden py-0.5">
        <motion.button
          type="button"
          onClick={handleAlert}
          whileTap={{ scale: 0.95 }}
          animate={isShaking ? { x: [0, -2, 2, -2, 2, 0] } : {}}
          transition={isShaking ? { duration: 0.5 } : {}}
          className={`${btnClass} shrink-0 bg-red-500 shadow-red-500/25 hover:shadow-lg`}
          title="Внимание"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2.5} />
          <span className="max-w-full text-center break-words">Внимание</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={handleOk}
          whileTap={{ scale: 0.95 }}
          className={`${btnClass} shrink-0`}
          style={{ backgroundColor: "#22C55E", boxShadow: "0 6px 12px -2px rgba(34, 197, 94, 0.35)" }}
          title="Всё купил"
        >
          <CheckCheck className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="max-w-full text-center break-words">Всё купил</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={toggleStoreMode}
          whileTap={{ scale: 0.95 }}
          className={`${btnClass} shrink-0 ${
            inStoreMode ? "bg-yellow-600 shadow-yellow-700/30" : "bg-yellow-400 shadow-yellow-500/25 hover:shadow-lg"
          }`}
          title={inStoreMode ? "Активен" : "В магазине"}
        >
          <Store className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="max-w-full text-center break-words">В магазине</span>
        </motion.button>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-xs rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-center gap-2 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Check className="h-5 w-5 text-green-600" />
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-8 hover:from-blue-600 hover:to-cyan-600">
              Понятно
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
