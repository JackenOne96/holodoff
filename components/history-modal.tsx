"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFridgeStore } from "@/lib/store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })

const formatDayLabel = (iso: string) => {
  const date = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (day.getTime() === today.getTime()) return "Сегодня"
  if (day.getTime() === yesterday.getTime()) return "Вчера"

  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { history, clearHistory, isLoading } = useFridgeStore()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<string, typeof history>()
    for (const item of history) {
      const key = new Date(item.purchasedAt).toISOString().slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)?.push(item)
    }
    const entries = Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([day, items]) => ({
        day,
        label: formatDayLabel(items[0]?.purchasedAt || day),
        items: items.sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)),
      }))
    return entries
  }, [history])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-green-500 p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-white" />
                <h2 className="text-lg font-semibold text-white">
                  История покупок
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmOpen(true)}
                  className="h-8 w-8 rounded-full text-white hover:bg-green-600"
                  title="Очистить историю"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full text-white hover:bg-green-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* History List */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  За последние 3 дня покупок не найдено
                </div>
              ) : (
                <div className="space-y-4">
                  {grouped.map((group, index) => (
                    <motion.div
                      key={`${group.day}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-gray-800">
                            {group.label}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="text-base leading-none">{item.emoji}</span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            <span className="shrink-0 text-xs text-gray-400">{formatTime(item.purchasedAt)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4">
              <Button
                onClick={onClose}
                className="w-full rounded-xl bg-green-500 py-5 text-white hover:bg-green-600"
              >
                Закрыть
              </Button>
            </div>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogContent className="max-w-xs rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-center">Очистить историю?</AlertDialogTitle>
                  <AlertDialogDescription className="text-center">
                    Вы уверены, что хотите удалить все купленные продукты?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                  <AlertDialogCancel disabled={isLoading} className="rounded-full">
                    Отмена
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isLoading}
                    className="rounded-full bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      const ok = await clearHistory()
                      if (ok) {
                        setConfirmOpen(false)
                        onClose()
                      }
                    }}
                  >
                    {isLoading ? "Удаляем..." : "Очистить"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
