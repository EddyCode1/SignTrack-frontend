import { useEffect, useState } from 'react'
import { onCallsHubReconnecting, onCallsHubClosed } from '../api/callsHubService'
import { onChatHubReconnecting, onChatHubClosed } from '../api/chatHubService'
import useLiveRegionStore from '../stores/useLiveRegionStore'

/**
 * Banner global — aparece si el hub de llamadas o el de chat entra en reconexión automática.
 * Si withAutomaticReconnect() agota sus reintentos (0/2/10/30s) y se rinde (onclose),
 * pasamos a "conexión perdida": las funciones en tiempo real (chat/llamadas) dejaron de
 * llegar y la única salida confiable es recargar la página.
 */
const ConnectionBanner = () => {
  const [calls, setCalls] = useState(false)
  const [chat, setChat] = useState(false)
  const [callsClosed, setCallsClosed] = useState(false)
  const [chatClosed, setChatClosed] = useState(false)
  const announce = useLiveRegionStore((s) => s.announce)

  useEffect(() => {
    const offCalls = onCallsHubReconnecting((reconnecting) => {
      setCalls(reconnecting)
      if (reconnecting) announce('Conexión perdida, reconectando...')
    })
    const offChat = onChatHubReconnecting((reconnecting) => {
      setChat(reconnecting)
      if (reconnecting) announce('Conexión perdida, reconectando...')
    })
    const offCallsClosed = onCallsHubClosed((closed) => {
      setCallsClosed(closed)
      if (closed) announce('No se pudo reconectar. Recarga la página para continuar.', { flash: true })
      else announce('Conexión recuperada')
    })
    const offChatClosed = onChatHubClosed((closed) => {
      setChatClosed(closed)
      if (closed) announce('No se pudo reconectar. Recarga la página para continuar.', { flash: true })
      else announce('Conexión recuperada')
    })
    return () => {
      offCalls()
      offChat()
      offCallsClosed()
      offChatClosed()
    }
  }, [announce])

  if (callsClosed || chatClosed) {
    return (
      <div className="app-connection-banner app-connection-banner--closed" role="alert">
        Conexión perdida — recarga la página para continuar
      </div>
    )
  }

  if (!calls && !chat) return null

  return (
    <div className="app-connection-banner" role="status" aria-live="polite">
      Reconectando...
    </div>
  )
}

export default ConnectionBanner
