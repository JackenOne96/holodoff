"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface AppErrorBoundaryProps {
  children: React.ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
  message: string
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "Неизвестная ошибка интерфейса",
    }
  }

  public componentDidCatch(error: Error) {
    console.error("AppErrorBoundary caught an error:", error)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-cyan-100/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-center shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800">Ошибка загрузки экрана</h2>
            <p className="mt-2 text-sm text-gray-600">
              Не удалось отрисовать один из компонентов. Обновите страницу или перезапустите приложение.
            </p>
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{this.state.message}</p>
            <Button className="mt-4 w-full" onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
