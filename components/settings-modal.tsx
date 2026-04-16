"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Volume2, X, Bug, MessageSquare } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [chatNotificationsEnabled, setChatNotificationsEnabled] = useState(true)
  const [volume, setVolume] = useState([70])
  const [debugBadgeEnabled, setDebugBadgeEnabled] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("fridge-settings")
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setNotificationsEnabled(settings.notificationsEnabled ?? true)
        setChatNotificationsEnabled(settings.chatNotificationsEnabled ?? true)
        setVolume([settings.volume ?? 70])
        setDebugBadgeEnabled(settings.debugBadgeEnabled ?? false)
      }
    } catch {
      // storage may be unavailable; keep defaults
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "fridge-settings",
        JSON.stringify({
          notificationsEnabled,
          chatNotificationsEnabled,
          volume: volume[0],
          debugBadgeEnabled,
        })
      )
      window.dispatchEvent(new Event("fridge-settings-changed"))
    } catch {
      // ignore
    }
  }, [notificationsEnabled, chatNotificationsEnabled, volume, debugBadgeEnabled])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Настройки</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Уведомления</p>
                <p className="text-sm text-gray-500">Push-уведомления</p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {/* Volume Slider */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Volume2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Громкость</p>
                <p className="text-sm text-gray-500">{volume[0]}%</p>
              </div>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Chat notifications toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Уведомления чата</p>
                <p className="text-sm text-gray-500">Звук и push на входящие</p>
              </div>
            </div>
            <Switch checked={chatNotificationsEnabled} onCheckedChange={setChatNotificationsEnabled} />
          </div>

          {/* Debug badge toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Bug className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Debug значок</p>
                <p className="text-sm text-gray-500">Статусы сети/Supabase/Storage</p>
              </div>
            </div>
            <Switch checked={debugBadgeEnabled} onCheckedChange={setDebugBadgeEnabled} />
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-6 text-white hover:from-blue-600 hover:to-cyan-600"
          >
            Сохранить
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Helper to get settings
export function getSettings() {
  if (typeof window === "undefined") {
    return { notificationsEnabled: true, chatNotificationsEnabled: true, volume: 70, debugBadgeEnabled: false }
  }
  try {
    const savedSettings = localStorage.getItem("fridge-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      return {
        notificationsEnabled: settings.notificationsEnabled ?? true,
        chatNotificationsEnabled: settings.chatNotificationsEnabled ?? true,
        volume: settings.volume ?? 70,
        debugBadgeEnabled: settings.debugBadgeEnabled ?? false,
      }
    }
  } catch {
    // ignore
  }
  return { notificationsEnabled: true, chatNotificationsEnabled: true, volume: 70, debugBadgeEnabled: false }
}
