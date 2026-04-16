"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App route error:", error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-cyan-100/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 text-center shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800">Ошибка загрузки приложения</h2>
        <p className="mt-2 text-sm text-gray-600">Произошла ошибка при инициализации экрана или данных.</p>
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error.message}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Полная перезагрузка
          </Button>
          <Button onClick={reset}>Повторить</Button>
        </div>
      </div>
    </div>
  )
}
