import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { endRoom, getRoom, joinRoom } from '../../../shared/api/services/callsService'
import { APP_ROUTES } from '../../../shared/config/paths'

const CallRoomPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      await joinRoom(roomId, user?.username || user?.nombre || 'Participante')
      setRoom(await getRoom(roomId))
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo entrar a la reunión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [roomId])

  const handleEnd = async () => {
    try {
      await endRoom(roomId)
      toast.success('Reunión terminada')
      navigate(APP_ROUTES.dashboardCalls)
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo terminar')
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/signtrack/dashboard/calls/${roomId}`
    navigator.clipboard.writeText(url)
    toast.success('Enlace copiado')
  }

  if (loading) return <div className="p-6">Entrando a la reunión...</div>
  if (!room) return <div className="p-6">Reunión no disponible</div>

  const tiles = room.participants?.length ? room.participants : [{ displayName: 'Tú' }]

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Link to={APP_ROUTES.dashboardCalls} className="text-[var(--accent)] hover:underline">
          ← Reuniones
        </Link>
        <h1 className="text-xl font-bold flex-1">{room.title}</h1>
        <button type="button" onClick={copyLink} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
          Copiar enlace
        </button>
        <button type="button" onClick={handleEnd} className="px-3 py-1 rounded bg-red-600 text-white">
          Terminar
        </button>
      </div>

      <p className="text-sm text-[var(--muted)] mb-4">
        Vista demo (sin video real). Participantes registrados: {room.participantCount}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((p, i) => (
          <div key={p.userId || i} className="card aspect-video flex flex-col items-center justify-center bg-[var(--surface)]">
            <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] mb-3" />
            <span className="font-medium">{p.displayName || p.userId}</span>
            <span className="text-xs text-[var(--muted)] mt-1">Cámara mock · Mic mock</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CallRoomPage
