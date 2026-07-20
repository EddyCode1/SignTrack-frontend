import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../shared/stores/useAuthStore'
import {
  getCallsHubConnection,
  onIncomingCall,
} from '../../shared/api/callsHubService'
import IncomingCallModal from '../../shared/components/IncomingCallModal'
import { APP_ROUTES } from '../../shared/config/paths'

/**
 * Mantiene la conexión al hub de Calls viva durante toda la sesión autenticada
 * (el hub agrega cada conexión a su grupo por-usuario en OnConnectedAsync) y
 * muestra IncomingCallModal cuando alguien nos invita a una reunión, sin
 * importar en qué pantalla estemos. Hermano de PresenceProvider, que hace lo
 * equivalente con el hub de chat.
 */
const CallInviteProvider = ({ children }) => {
  const authed = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [invite, setInvite] = useState(null)

  useEffect(() => {
    if (!authed) {
      setInvite(null)
      return
    }

    let off = () => {}
    let cancelled = false

    const init = async () => {
      try {
        // Mismo fix que PresenceProvider (Fase 1): la conexión debe existir antes
        // de suscribirse, porque onIncomingCall registra sobre sharedConnection y
        // devuelve un no-op si aún no se creó.
        await getCallsHubConnection()
        if (cancelled) return

        off = onIncomingCall((payload) => {
          if (!payload?.roomId) return
          // Si ya estamos dentro de esa misma sala, no tiene sentido el modal.
          if (window.location.pathname.endsWith(`${APP_ROUTES.dashboardCalls}/${payload.roomId}`)) return
          setInvite(payload)
        })
      } catch {
        /* hub opcional: sin conexión no hay invitaciones, el resto de la app sigue */
      }
    }

    init()

    return () => {
      cancelled = true
      off()
    }
  }, [authed])

  const handleAccept = () => {
    const roomId = invite?.roomId
    setInvite(null)
    if (roomId) navigate(`${APP_ROUTES.dashboardCalls}/${roomId}`)
  }

  return (
    <>
      {children}
      <IncomingCallModal
        invite={invite}
        onAccept={handleAccept}
        onDecline={() => setInvite(null)}
      />
    </>
  )
}

export default CallInviteProvider
