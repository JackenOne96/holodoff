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

type SignalType = "alert" | "ok" | "store" | "ack"

export const showNotification = async (
  title: string,
  options?: NotificationOptions,
  signalType?: SignalType
): Promise<void> => {
  if (typeof window === "undefined") return
  if (!("Notification" in window) || Notification.permission !== "granted") return

  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return
  const registration = await navigator.serviceWorker.ready
  const notificationOptions: NotificationOptions = {
    ...options,
    icon: signalType ? `/icons/signal-${signalType}.png` : options?.icon,
  }
  await registration.showNotification(title, notificationOptions)
}
