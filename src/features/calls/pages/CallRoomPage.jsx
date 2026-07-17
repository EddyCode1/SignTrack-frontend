import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getLiveKitToken, getRoom, joinRoom } from '../../../shared/api/services/callsService'
import {
  getCallsHubConnection,
  joinCallRoomHub,
  leaveCallRoomHub,
  onRoomEnded,
} from '../../../shared/api/callsHubService'
import { APP_ROUTES } from '../../../shared/config/paths'
import LiveKitCallRoom from '../components/LiveKitCallRoom'
import MeshCallRoom from '../components/MeshCallRoom'

const CallRoomPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const currentUserId = user?.id || user?._id

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mediaError, setMediaError] = useState(null)
  const [liveKit, setLiveKit] = useState(null)
  const [iceServers, setIceServers] = useState([])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      setLoading(true)
      setMediaError(null)

      try {
        const joinData = await joinRoom(roomId, user?.username || user?.nombre || 'Participante')
        const roomData = await getRoom(roomId)
        if (cancelled) return
        setRoom(roomData)

        if (joinData.useLiveKit) {
          try {
            const lk = await getLiveKitToken(roomId)
            if (!cancelled) {
              setLiveKit({
                token: lk.token,
                url: lk.url || joinData.liveKitUrl,
              })
            }
            await getCallsHubConnection()
            if (!cancelled) await joinCallRoomHub(roomId)
            return
          } catch (err) {
            console.warn('LiveKit no disponible, usando WebRTC mesh:', err)
            toast.error(
              'LiveKit no disponible — usando videollamada directa (mesh). Para grupos grandes: docker compose up livekit -d',
              { duration: 5000 },
            )
          }
        }

        setIceServers(
          (joinData.iceServers || []).map((s) => ({
            urls: s.urls,
            username: s.username,
            credential: s.credential,
          }))
        )
        await getCallsHubConnection()
        if (!cancelled) await joinCallRoomHub(roomId)
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
          setMediaError('Permite acceso a cámara y micrófono para la videollamada.')
        } else {
          toast.error(err.response?.data?.message || err.message || 'No se pudo entrar a la reunión')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      leaveCallRoomHub(roomId).catch(() => {})
    }
  }, [roomId, user])

  useEffect(() => {
    const offEnded = onRoomEnded(({ roomId: rid }) => {
      if (rid !== roomId) return
      toast('La reunión terminó')
      navigate(APP_ROUTES.dashboardCalls)
    })
    return offEnded
  }, [roomId, navigate])

  if (loading) return <div className="p-6">Entrando a la reunión...</div>

  if (liveKit && room) {
    return (
      <LiveKitCallRoom
        room={room}
        roomId={roomId}
        token={liveKit.token}
        serverUrl={liveKit.url}
        isHost={room.hostUserId === currentUserId}
        onLeave={() => navigate(APP_ROUTES.dashboardCalls)}
      />
    )
  }

  if (mediaError) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">{mediaError}</p>
        <Link to={APP_ROUTES.dashboardCalls} className="text-[var(--accent)] hover:underline">
          ← Volver a reuniones
        </Link>
      </div>
    )
  }

  if (!room) return <div className="p-6">Reunión no disponible</div>

  return (
    <MeshCallRoom
      room={room}
      roomId={roomId}
      currentUserId={currentUserId}
      iceServers={iceServers}
      onLeave={() => navigate(APP_ROUTES.dashboardCalls)}
    />
  )
}

export default CallRoomPage
