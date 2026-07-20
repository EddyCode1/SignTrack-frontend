import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiUserPlus } from 'react-icons/fi'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getDirectory } from '../../../shared/api/services/userService'
import { inviteToCallHub } from '../../../shared/api/callsHubService'

const personId = (p) => p._id || p.id

const personLabel = (p) => {
  const fullName = `${p.name || ''} ${p.surname || ''}`.trim()
  return fullName || p.username || p.email || personId(p)
}

/**
 * Botón "Invitar" (solo host) con un selector de contactos/directorio.
 * Envía la invitación por el hub de Calls (InviteToCall) — el invitado la
 * recibe como "IncomingCall" esté donde esté (CallInviteProvider).
 */
const InviteToCallPanel = ({ roomId }) => {
  const user = useAuthStore((s) => s.user)
  const currentUserId = user?.id || user?._id

  const [open, setOpen] = useState(false)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        // Igual que en Contactos: cualquiera puede invitar a cualquiera del directorio,
        // sin requerir contacto aceptado (antes había un fallback contactos→directorio
        // que hacía que el conjunto invitable cambiara según cuántos contactos tuvieras).
        const list = await getDirectory()
        if (!cancelled) {
          setPeople(list.filter((p) => personId(p) !== currentUserId))
        }
      } catch {
        if (!cancelled) toast.error('No se pudieron cargar los contactos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open, currentUserId])

  const handleInvite = async () => {
    if (!selectedId) return
    setSending(true)
    try {
      await inviteToCallHub(roomId, selectedId)
      toast.success('Invitación enviada')
      setOpen(false)
      setSelectedId('')
    } catch (err) {
      toast.error(err?.message || 'No se pudo enviar la invitación')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1 rounded border border-[var(--accent-soft)] inline-flex items-center gap-1"
        aria-expanded={open}
      >
        <FiUserPlus aria-hidden="true" /> Invitar
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-40 card p-3 w-72 shadow-lg">
          <label htmlFor="invite-select" className="block text-sm mb-1">
            Invitar a la reunión
          </label>
          {loading ? (
            <p className="text-sm text-[var(--muted)] py-2">Cargando contactos…</p>
          ) : people.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-2">No hay personas para invitar.</p>
          ) : (
            <select
              id="invite-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 mb-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
            >
              <option value="">Selecciona una persona…</option>
              {people.map((p) => (
                <option key={personId(p)} value={personId(p)}>
                  {personLabel(p)}
                </option>
              ))}
            </select>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1 rounded border border-[var(--accent-soft)] text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleInvite}
              disabled={!selectedId || sending}
              className="btn-brand px-3 py-1 text-sm disabled:opacity-50"
            >
              {sending ? 'Enviando…' : 'Invitar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default InviteToCallPanel
