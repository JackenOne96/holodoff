self.addEventListener("push", (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : "" }
  }

  const title = data.title || "ХолодOFF"
  const signalType = data.signalType || (data.data && data.data.signalType)
  const signalIcon = signalType ? `/icons/signal-${signalType}.png` : null
  const options = {
    body: data.body || "",
    icon: signalIcon || data.icon || "/icon.svg",
    badge: data.badge || "/icon.svg",
    tag: data.tag || "family-signal",
    data: data.data || {},
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || "/"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus()
          if ("navigate" in client) {
            client.navigate(targetUrl)
          }
          return
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
      return undefined
    })
  )
})
