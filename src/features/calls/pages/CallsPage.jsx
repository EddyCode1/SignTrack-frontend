import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createRoom, getRoomHistory, getRooms } from '../../../shared/api/services/callsService'
import useAuthStore from '../../../shared/stores/useAuthStore'

const formatDuration = (seconds) => {
  const s = Math.max(0, Number(seconds) || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rest = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${rest}s`
  return `${rest}s`
}

const formatDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '-'
    : d.toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
}

const CallsPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [rooms, setRooms] = useState([])
  const [history, setHistory] = useState([])
  const [tab, setTab] = useState('active')
  const [title, setTitle] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(8)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setRooms(await getRooms())
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar reuniones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (tab !== 'history') return
    let cancelled = false
    setHistoryLoading(true)
    getRoomHistory()
      .then((items) => {
        if (!cancelled) setHistory(items)
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.response?.data?.message || 'Error al cargar el historial')
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tab])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const room = await createRoom({
        title: title.trim(),
        maxParticipants,
        displayName: user?.username || user?.nombre || undefined,
      })
      toast.success('Reunión creada')
      navigate(`/dashboard/calls/${room.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo crear la reunión')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="p-6">Cargando reuniones...</div>

  const activeRooms = rooms.filter((r) => r.status !== 'ended')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Llamadas</h1>

      <form onSubmit={handleCreate} className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm mb-1">Nueva reunión</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la reunión"
            className="w-full px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
          >
            <option value={2}>1:1 (WebRTC)</option>
            <option value={8}>Grupo (LiveKit, hasta 8)</option>
          </select>
        </div>
        <button type="submit" disabled={creating} className="btn-brand px-4 py-2">
          {creating ? 'Creando...' : 'Crear reunión'}
        </button>
      </form>

      <div className="flex gap-2 mb-4" role="tablist" aria-label="Reuniones">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'active'}
          onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            tab === 'active'
              ? 'btn-brand border-transparent'
              : 'border-[var(--accent-soft)] text-[var(--text)] hover:bg-[var(--surface)]'
          }`}
        >
          Activas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'history'}
          onClick={() => setTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${
            tab === 'history'
              ? 'btn-brand border-transparent'
              : 'border-[var(--accent-soft)] text-[var(--text)] hover:bg-[var(--surface)]'
          }`}
        >
          Recientes
        </button>
      </div>

      {tab === 'active' ? (
        <div className="card overflow-hidden">
          {activeRooms.length === 0 ? (
            <p className="p-6 text-[var(--muted)]">No tienes reuniones activas.</p>
          ) : (
            <ul className="divide-y divide-[var(--accent-soft)]">
              {activeRooms.map((room) => (
                <li key={room.id}>
                  <Link to={`/dashboard/calls/${room.id}`} className="block px-4 py-3 hover:bg-[var(--surface)]">
                    <div className="font-medium">{room.title}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {room.status} · {room.participantCount}/{room.maxParticipants} participantes
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          {historyLoading ? (
            <p className="p-6 text-[var(--muted)]">Cargando historial...</p>
          ) : history.length === 0 ? (
            <p className="p-6 text-[var(--muted)]">Aún no tienes llamadas terminadas.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--accent-soft)]">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text)]">Reunión</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text)]">Terminó</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text)]">Duración</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--text)]">Participantes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--accent-soft)] hover:bg-[var(--surface)]">
                    <td className="px-6 py-4 text-[var(--text)] font-medium">{item.title}</td>
                    <td className="px-6 py-4 text-[var(--text)]">{formatDate(item.endedAt)}</td>
                    <td className="px-6 py-4 text-[var(--text)]">{formatDuration(item.durationSeconds)}</td>
                    <td className="px-6 py-4 text-[var(--text)]">{item.participantCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default CallsPage
