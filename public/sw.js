self.addEventListener('push', (event) => {
  let payload = { title: 'SignTrack', body: 'Nuevo mensaje', url: '/signtrack/dashboard/chats' }
  try {
    if (event.data) payload = { ...payload, ...event.data.json() }
  } catch {
    /* payload por defecto */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/signtrack/favicon.ico',
      data: { url: payload.url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/signtrack/dashboard/chats'
  event.waitUntil(clients.openWindow(url))
})
