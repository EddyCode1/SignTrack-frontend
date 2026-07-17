import messagingClient from './messagingClient'

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/signtrack/sw.js', { scope: '/signtrack/' })
  } catch (err) {
    console.warn('Service worker:', err)
    return null
  }
}

export const subscribeToPush = async () => {
  if (!('PushManager' in window) || !('Notification' in window)) return false

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  const reg = await registerServiceWorker()
  if (!reg) return false

  const { data } = await messagingClient.get('/notifications/vapid-public-key')
  if (!data?.enabled || !data?.publicKey) return false

  let subscription = await reg.pushManager.getSubscription()
  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    })
  }

  const json = subscription.toJSON()
  await messagingClient.post('/notifications/subscribe', {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
  })

  return true
}

export const updateAppBadge = async (count) => {
  if ('setAppBadge' in navigator) {
    try {
      if (count > 0) await navigator.setAppBadge(count)
      else await navigator.clearAppBadge()
    } catch {
      /* ignore */
    }
  }
}

export const fetchUnreadTotal = async () => {
  const { data } = await messagingClient.get('/conversations/unread-total')
  return data?.total ?? 0
}
