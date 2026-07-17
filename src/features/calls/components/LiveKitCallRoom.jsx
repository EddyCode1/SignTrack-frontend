import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from '@livekit/components-react'
import toast from 'react-hot-toast'
import { endRoom } from '../../../shared/api/services/callsService'
import { APP_ROUTES } from '../../../shared/config/paths'
import CallSideChat from './CallSideChat'
import CallTranslationOverlay from './CallTranslationOverlay'
import SignLanguagePanel from '../../chats/components/SignLanguagePanel'

const LiveKitCallRoom = ({
  room,
  roomId,
  token,
  serverUrl,
  isHost,
  onLeave,
}) => {
  const [chatOpen, setChatOpen] = useState(true)
  const [conversationId, setConversationId] = useState(null)

  const handleEnd = async () => {
    try {
      await endRoom(roomId)
      toast.success('Reunión terminada')
      onLeave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo terminar')
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/signtrack/dashboard/calls/${roomId}`
    navigator.clipboard.writeText(url)
    toast.success('Enlace copiado')
  }

  const lkUrl = serverUrl || import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880'

  return (
    <div className="p-4 lg:p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
        <Link to={APP_ROUTES.dashboardCalls} className="text-[var(--accent)] hover:underline">
          ← Reuniones
        </Link>
        <h1 className="text-xl font-bold flex-1">{room.title}</h1>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">LiveKit</span>
        <button type="button" onClick={copyLink} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
          Copiar enlace
        </button>
        <button
          type="button"
          onClick={() => setChatOpen((v) => !v)}
          className="px-3 py-1 rounded border border-[var(--accent-soft)]"
        >
          {chatOpen ? 'Ocultar chat' : 'Chat'}
        </button>
        <button type="button" onClick={onLeave} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
          Salir
        </button>
        {isHost && (
          <button type="button" onClick={handleEnd} className="px-3 py-1 rounded bg-red-600 text-white">
            Terminar
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-h-[280px] rounded-lg overflow-hidden bg-black border border-[var(--accent-soft)] relative">
          <LiveKitRoom
            video
            audio
            token={token}
            serverUrl={lkUrl}
            connect
            onDisconnected={onLeave}
            data-lk-theme="default"
            style={{ height: '100%' }}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
          <CallTranslationOverlay conversationId={conversationId} />
        </div>

        {chatOpen && (
          <div className="w-full lg:w-80 shrink-0 min-h-[240px] flex flex-col gap-3">
            <div className="flex-1 min-h-[180px]">
              <CallSideChat roomId={roomId} onConversationReady={setConversationId} />
            </div>
            {conversationId ? (
              <SignLanguagePanel conversationId={conversationId} autoStart={false} />
            ) : (
              <div className="card p-4 text-xs text-[var(--muted)]">Esperando chat de reunión…</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveKitCallRoom
