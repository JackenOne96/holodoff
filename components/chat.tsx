"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFridgeStore } from "@/lib/store"
import { getSettings } from "./settings-modal"
import { showNotification } from "@/lib/notifications"

// Sound frequencies for different users
const userSounds: Record<string, number> = {
  "М": 880,   // A5 - Мама
  "П": 659,   // E5 - Папа
  "А": 784,   // G5 - Аня
  "Я": 523,   // C5 - Default
}

const SEND_SOUND_FREQUENCY = 980
const getInitial = (value: string) => (value.trim().charAt(0) || "Я").toUpperCase()

export function Chat() {
  const { messages, addMessage, userName, currentMemberId } = useFridgeStore()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevMessageCount = useRef(messages.length)

  const playTone = (frequency: number, duration = 0.3) => {
    const settings = getSettings()
    if (!settings.notificationsEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      const volume = (settings.volume / 100) * 0.2
      
      oscillator.frequency.value = frequency
      oscillator.type = "sine"
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch {
      // Audio not supported
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
    // Play sound for new messages from other users
    if (messages.length > prevMessageCount.current) {
      const newMsg = messages[messages.length - 1]
      // Only play sound/notification if message is from someone else
      if (newMsg && !newMsg.isSystem && newMsg.senderId !== currentMemberId) {
        const settings = getSettings()
        if (settings.notificationsEnabled && settings.chatNotificationsEnabled) {
          playTone(userSounds[getInitial(newMsg.sender)] || 523)
          // Push notification (only if enabled)
          const title = "ХолодOFF: новое сообщение"
          const body = `${newMsg.sender}: ${newMsg.text}`
          void showNotification(title, { body, tag: "chat-message" })
        }
      }
    }
    prevMessageCount.current = messages.length
  }, [messages, currentMemberId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      await addMessage(newMessage.trim(), userName || "Я")
      playTone(SEND_SOUND_FREQUENCY, 0.18)
      setNewMessage("")
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex h-[30%] flex-col rounded-t-3xl bg-[#FFF1E6] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-orange-200/50 px-4 py-2">
        <span className="text-sm font-medium text-orange-800/70">
          Семейный чат
        </span>
        <span className="text-xs text-orange-600/50">
          {messages.length} сообщений
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-2 flex ${
                message.isSystem ? "justify-center" : message.senderId && currentMemberId && message.senderId === currentMemberId ? "justify-end" : "justify-start"
              }`}
            >
              {message.isSystem ? (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs text-amber-700">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{message.text}</span>
                </div>
              ) : (
                (() => {
                  const isMine = Boolean(message.senderId && currentMemberId && message.senderId === currentMemberId)
                  return (
                    <div className={`flex max-w-[85%] gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-pink-400 text-xs font-medium text-white">
                        {message.senderAvatar || getInitial(message.sender)}
                      </div>
                      <div className={`flex min-w-0 flex-col ${isMine ? "items-end" : "items-start"}`}>
                        <div
                          className={`inline-block rounded-2xl px-3 py-2 shadow-sm ${
                            isMine ? "rounded-tr-sm bg-emerald-500/90 text-white" : "rounded-tl-sm bg-white text-gray-800"
                          }`}
                        >
                          <p className="break-words text-sm">{message.text}</p>
                        </div>
                        <p className="mt-0.5 text-[10px] text-orange-600/50">
                          {message.sender} · {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })()
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 border-t border-orange-200/50 p-3">
        <Input
          type="text"
          placeholder="Сообщение..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-full border-orange-200 bg-white/80 placeholder:text-orange-300 focus-visible:ring-orange-300"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newMessage.trim()}
          className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
