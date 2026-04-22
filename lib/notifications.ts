"use client"

const SERVICE_WORKER_PATH = "/service-worker.js"

export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return
  }

  try {
    await navigator.serviceWorker.register(SERVICE_WORKER_PATH)
  } catch (error) {
    console.error("Service worker registration failed", error)
  }
}

export const requestNotificationPermission = async (): Promise<NotificationPermission | "unsupported"> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported"
  }

  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission
  }

  try {
    return await Notification.requestPermission()
  } catch {
    return "default"
  }
}

export const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
  if (typeof window === "undefined") return

  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return
  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(title, options)
}
