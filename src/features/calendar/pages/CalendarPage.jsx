import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import CalendarGrid from '../components/CalendarGrid'
import { getDirectory } from '../../../shared/api/services/userService'
import { createRequest } from '../../../shared/api/services/requestService'
import { createAppointment, getAppointments, startAppointmentMeeting } from '../../../shared/api/services/appointmentService'

const CalendarPage = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [contacts, setContacts] = useState([])
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [selectedDay, setSelectedDay] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [inviteIds, setInviteIds] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [appointments, directory] = await Promise.all([
        getAppointments(),
        getDirectory(''),
      ])
      setItems(appointments)
      setContacts(directory)
    } catch {
      toast.error('Error al cargar calendario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return []
    return items.filter((item) => {
      const startDate = new Date(item.startUtc)
      const endDate = new Date(item.endUtc)
      const dayStart = new Date(selectedDay)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(selectedDay)
      dayEnd.setHours(23, 59, 59, 999)
      return startDate <= dayEnd && endDate >= dayStart
    })
  }, [items, selectedDay])

  const shiftCursor = (delta) => {
    const next = new Date(cursor)
    if (view === 'week') {
      next.setDate(next.getDate() + delta * 7)
    } else {
      next.setMonth(next.getMonth() + delta)
    }
    setCursor(next)
  }

  const openFormForDay = (day) => {
    setSelectedDay(day)
    setShowForm(true)
    const startLocal = new Date(day)
    startLocal.setHours(9, 0, 0, 0)
    const endLocal = new Date(day)
    endLocal.setHours(10, 0, 0, 0)
    setStart(startLocal.toISOString().slice(0, 16))
    setEnd(endLocal.toISOString().slice(0, 16))
  }

  const toggleInvite = (userId) => {
    setInviteIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !start || !end) return
    try {
      const appointment = await createAppointment({
        title: title.trim(),
        startUtc: new Date(start).toISOString(),
        endUtc: new Date(end).toISOString(),
        participantUserIds: inviteIds,
      })

      await Promise.all(
        inviteIds.map((toUserId) =>
          createRequest({
            type: 'meeting',
            toUserId,
            appointmentId: appointment.id,
            message: `Invitación a la cita: ${appointment.title}`,
          })
        )
      )

      setTitle('')
      setStart('')
      setEnd('')
      setInviteIds([])
      setShowForm(false)
      toast.success('Cita creada e invitaciones enviadas')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear cita')
    }
  }

  const handleStartMeeting = async (appointment) => {
    try {
      const updated = await startAppointmentMeeting(appointment.id)
      navigate(`/dashboard/calls/${updated.roomId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo iniciar reunión')
    }
  }

  const monthLabel = cursor.toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })

  if (loading) return <div className="p-6">Cargando calendario...</div>

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded text-sm ${view === 'month' ? 'bg-[var(--primary)] text-white' : 'border border-[var(--accent-soft)]'}`}
          >
            Mes
          </button>
          <button
            type="button"
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded text-sm ${view === 'week' ? 'bg-[var(--primary)] text-white' : 'border border-[var(--accent-soft)]'}`}
          >
            Semana
          </button>
          <button type="button" onClick={() => setShowForm(true)} className="btn-brand px-3 py-1 text-sm">
            Nueva cita
          </button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => shiftCursor(-1)} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
            ←
          </button>
          <h2 className="font-semibold capitalize">{monthLabel}</h2>
          <button type="button" onClick={() => shiftCursor(1)} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
            →
          </button>
        </div>
        <CalendarGrid
          view={view}
          cursor={cursor}
          items={items}
          onSelectDay={openFormForDay}
        />
      </div>

      {selectedDay && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold mb-3">
            Eventos del {selectedDay.toLocaleDateString('es-GT')}
          </h3>
          {selectedDayEvents.length === 0 ? (
            <p className="text-[var(--muted)] text-sm">Sin eventos este día.</p>
          ) : (
            selectedDayEvents.map((item) => (
              <div key={item.id} className="py-2 flex flex-wrap items-center gap-3 border-b border-[var(--accent-soft)] last:border-0">
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {new Date(item.startUtc).toLocaleTimeString()} — {new Date(item.endUtc).toLocaleTimeString()}
                  </div>
                  {item.participants?.length > 0 && (
                    <div className="text-xs text-[var(--muted)] mt-1">
                      {item.participants.length} participante(s)
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleStartMeeting(item)}
                  className="px-3 py-1 rounded bg-[var(--primary)] text-white text-sm"
                >
                  Iniciar reunión
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Agendar cita</h3>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la cita"
              className="px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)] md:col-span-2"
            />
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
            />
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
            />
            <div className="md:col-span-2">
              <p className="text-sm font-medium mb-2">Invitar participantes</p>
              <div className="max-h-40 overflow-y-auto border border-[var(--accent-soft)] rounded-lg p-2 space-y-1">
                {contacts.length === 0 ? (
                  <p className="text-sm text-[var(--muted)] p-2">No hay contactos disponibles.</p>
                ) : (
                  contacts.map((c) => (
                    <label key={c._id} className="flex items-center gap-2 text-sm p-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteIds.includes(c._id)}
                        onChange={() => toggleInvite(c._id)}
                      />
                      {c.name} {c.surname} (@{c.username})
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-brand px-4">Guardar cita</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded border border-[var(--accent-soft)]">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default CalendarPage
