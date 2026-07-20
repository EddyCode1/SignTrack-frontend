import { createContext, useContext, useEffect, useState } from 'react'
import useAuthStore from '../../shared/stores/useAuthStore'
import {
  getChatHubConnection,
  joinPresenceHub,
  onReceiveMessage,
  onUserPresenceChanged,
} from '../../shared/api/chatHubService'
import { getOnlineUserIds, sendPresenceHeartbeat } from '../../shared/api/services/presenceService'
import useLiveRegionStore from '../../shared/stores/useLiveRegionStore'

export const OnlinePresenceContext = createContext(new Set())

export const useOnlinePresence = () => useContext(OnlinePresenceContext)

const PresenceProvider = ({ children }) => {
  const authed = useAuthStore((s) => s.isAuthenticated)
  const [onlineIds, setOnlineIds] = useState(() => new Set())

  useEffect(() => {
    if (!authed) return

    let heartbeatId = null
    let offPresence = () => {}
    let offMessage = () => {}
    let cancelled = false

    const init = async () => {
      try {
        // Aislado a propósito: si el REST de presencia inicial falla, igual queremos
        // que las suscripciones en tiempo real de abajo se registren (no dependen de esto).
        try {
          const ids = await getOnlineUserIds()
          if (!cancelled) setOnlineIds(new Set(ids))
        } catch {
          /* la lista inicial es un nice-to-have; el hub sigue trayendo cambios en vivo */
        }
        if (cancelled) return

        // La conexión debe existir antes de suscribirse: onReceiveMessage/onUserPresenceChanged
        // se registran en sharedConnection, que getChatHubConnection() crea de forma perezosa.
        await getChatHubConnection()
        if (cancelled) return

        offPresence = onUserPresenceChanged(({ userId, online }) => {
          setOnlineIds((prev) => {
            const next = new Set(prev)
            if (online) next.add(userId)
            else next.delete(userId)
            return next
          })
        })

        offMessage = onReceiveMessage(() => {
          window.dispatchEvent(new CustomEvent('signtrack:chat-message'))
          useLiveRegionStore.getState().announce('Nuevo mensaje recibido', { flash: true })
        })

        await joinPresenceHub()
        await sendPresenceHeartbeat()
        heartbeatId = setInterval(() => {
          sendPresenceHeartbeat().catch(() => {})
        }, 60000)
      } catch {
        /* hub opcional */
      }
    }

    init()

    return () => {
      cancelled = true
      clearInterval(heartbeatId)
      offPresence()
      offMessage()
    }
  }, [authed])

  return (
    <OnlinePresenceContext.Provider value={onlineIds}>
      {children}
    </OnlinePresenceContext.Provider>
  )
}

export default PresenceProvider
