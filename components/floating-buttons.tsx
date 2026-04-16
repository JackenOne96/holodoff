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
  const { addMessage, userName } = useFridgeStore()

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
          // Sharp, short, attention-grabbing beep
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
      await pushNotify("ХолодOFF: В магазине", "Пользователь сейчас в магазине")
      await addMessage(`${initial} сейчас в магазине! Пишите, что нужно купить.`, "Система", true)
      setDialogMessage("Все члены семьи уведомлены!")
      setShowDialog(true)
    }
  }

  // Button size reduced by 30%: was h-14 w-14, now h-10 w-10
  // Icon size reduced by 30%: was h-6 w-6, now h-4 w-4

  return (
    <>
      {/* Shake overlay for screen effect */}
      {isShaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.1, 0],
            x: [0, -5, 5, -5, 5, 0]
          }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 z-40 bg-red-500"
        />
      )}

      <div className="fixed left-3 right-3 z-30 grid grid-cols-3 gap-2" style={{ bottom: "calc(30% + 68px)" }}>
        <motion.button
          onClick={handleAlert}
          whileTap={{ scale: 0.9 }}
          animate={isShaking ? { x: [0, -3, 3, -3, 3, 0] } : {}}
          transition={isShaking ? { duration: 0.5 } : {}}
          className="flex h-10 items-center justify-center gap-1 rounded-full bg-red-500 px-2 text-xs font-semibold text-white shadow-lg shadow-red-500/30 transition-shadow hover:shadow-xl hover:shadow-red-500/40"
          title="Внимание"
        >
          <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
          <span>Внимание</span>
        </motion.button>

        <motion.button
          onClick={handleOk}
          whileTap={{ scale: 0.9 }}
          className="flex h-10 items-center justify-center gap-1 rounded-full px-2 text-xs font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
          style={{ backgroundColor: "#22C55E", boxShadow: "0 10px 15px -3px rgba(34, 197, 94, 0.3)" }}
          title="Всё купил"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Всё купил</span>
        </motion.button>
        <motion.button
          onClick={toggleStoreMode}
          whileTap={{ scale: 0.95 }}
          className={`flex h-10 items-center justify-center gap-1 rounded-full px-2 text-xs font-semibold text-white shadow-lg transition-all ${
            inStoreMode 
              ? "bg-yellow-600 shadow-yellow-700/40" 
              : "bg-yellow-400 shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40"
          }`}
          title={inStoreMode ? "Активен" : "В магазине"}
        >
          <Store className="h-4 w-4" />
          <span>В магазине</span>
        </motion.button>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-xs rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-center gap-2 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Check className="h-5 w-5 text-green-600" />
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              {dialogMessage}
            </AlertDialogDescription>
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
