import { createContext, useContext, useEffect, useState } from 'react'
import useAuthStore from '../../shared/stores/useAuthStore'
import {
  getChatHubConnection,
  joinPresenceHub,
  onReceiveMessage,
  onUserPresenceChanged,
} from '../../shared/api/chatHubService'
import { getOnlineUserIds, sendPresenceHeartbeat } from '../../shared/api/services/presenceService'

export const OnlinePresenceContext = createContext(new Set())

export const useOnlinePresence = () => useContext(OnlinePresenceContext)

const PresenceProvider = ({ children }) => {
  const authed = useAuthStore((s) => s.isAuthenticated)
  const [onlineIds, setOnlineIds] = useState(() => new Set())

  useEffect(() => {
    if (!authed) return

    let heartbeatId = null

    const init = async () => {
      try {
        const ids = await getOnlineUserIds()
        setOnlineIds(new Set(ids))
        await getChatHubConnection()
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

    const offPresence = onUserPresenceChanged(({ userId, online }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev)
        if (online) next.add(userId)
        else next.delete(userId)
        return next
      })
    })

    const offMessage = onReceiveMessage(() => {
      window.dispatchEvent(new CustomEvent('signtrack:chat-message'))
    })

    return () => {
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
