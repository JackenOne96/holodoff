"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFridgeStore } from "@/lib/store"
import { SettingsModal } from "./settings-modal"

export function FridgeHeader() {
  const { familyCode, familyMembers, userName } = useFridgeStore()
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(familyCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <header className="flex h-[8%] min-h-[56px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-800">Холодильник</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Family members avatars */}
          <div className="flex -space-x-2">
            {familyMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white ${member.color} text-xs font-medium text-white shadow-sm`}
                title={member.name}
              >
                {member.avatar || member.initial}
              </motion.div>
            ))}
            {userName && !familyMembers.find((m) => m.initial === userName.charAt(0).toUpperCase()) && (
              <motion.div
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-500 text-xs font-medium text-white shadow-sm"
                title={userName}
              >
                {userName.charAt(0).toUpperCase()}
              </motion.div>
            )}
          </div>

          {/* Family code dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-full bg-white/60 px-3 text-xs text-gray-600 shadow-sm hover:bg-white/80"
              >
                <Users className="h-3.5 w-3.5" />
                Код
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-center">Код группы</DialogTitle>
                <DialogDescription className="text-center">
                  Поделитесь этим кодом с членами семьи
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3">
                  <span className="font-mono text-2xl font-bold tracking-widest text-gray-800">
                    {familyCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyCode}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Максимум участников: 5
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Settings button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="h-8 w-8 rounded-full bg-white/60 shadow-sm hover:bg-white/80"
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
