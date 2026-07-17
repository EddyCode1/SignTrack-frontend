import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createRoom, getRooms } from '../../../shared/api/services/callsService'

const CallsPage = () => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [title, setTitle] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(8)
  const [loading, setLoading] = useState(true)
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

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const room = await createRoom({ title: title.trim(), maxParticipants })
      toast.success('Reunión creada')
      navigate(`/dashboard/calls/${room.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo crear la reunión')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="p-6">Cargando reuniones...</div>

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

      <div className="card overflow-hidden">
        {rooms.length === 0 ? (
          <p className="p-6 text-[var(--muted)]">No tienes reuniones aún.</p>
        ) : (
          <ul className="divide-y divide-[var(--accent-soft)]">
            {rooms.map((room) => (
              <li key={room.id}>
                {room.status === 'ended' ? (
                  <div className="block px-4 py-3 opacity-60 cursor-not-allowed">
                    <div className="font-medium">{room.title}</div>
                    <div className="text-sm text-[var(--muted)]">
                      terminada · {room.participantCount}/{room.maxParticipants} participantes
                    </div>
                  </div>
                ) : (
                  <Link to={`/dashboard/calls/${room.id}`} className="block px-4 py-3 hover:bg-[var(--surface)]">
                    <div className="font-medium">{room.title}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {room.status} · {room.participantCount}/{room.maxParticipants} participantes
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default CallsPage
