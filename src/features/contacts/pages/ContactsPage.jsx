import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getContacts } from '../../../shared/api/services/userService'
import { createConversation } from '../../../shared/api/services/chatService'
import { createRequest } from '../../../shared/api/services/requestService'
import useAuthStore from '../../../shared/stores/useAuthStore'

const ContactsPage = () => {
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id || s.user?._id)
  const [contacts, setContacts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = async (search = query) => {
    setLoading(true)
    try {
      setContacts(await getContacts(search))
    } catch {
      toast.error('Error al cargar contactos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load('')
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts
    const term = query.toLowerCase()
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.surname?.toLowerCase().includes(term) ||
        c.username?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
    )
  }, [contacts, query])

  const handleSearch = (e) => {
    e.preventDefault()
    load(query)
  }

  const handleMessage = async (contact) => {
    setBusyId(contact._id)
    try {
      const chat = await createConversation({ targetUserId: contact._id })
      navigate(`/dashboard/chats/${chat.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo abrir el chat')
    } finally {
      setBusyId(null)
    }
  }

  const handleContactRequest = async (contact) => {
    setBusyId(`req-${contact._id}`)
    try {
      await createRequest({
        type: 'contact',
        toUserId: contact._id,
        message: 'Solicitud de contacto',
      })
      toast.success('Solicitud enviada')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar solicitud')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Contactos</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Usuarios disponibles para chatear o enviar solicitudes.
      </p>

      <form onSubmit={handleSearch} className="card p-4 mb-6 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, usuario o email..."
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
        />
        <button type="submit" className="btn-brand px-4">Buscar</button>
      </form>

      {loading ? (
        <p className="text-[var(--muted)]">Cargando contactos...</p>
      ) : (
        <div className="card divide-y divide-[var(--accent-soft)]">
          {filtered.length === 0 ? (
            <p className="p-6 text-[var(--muted)]">No se encontraron contactos.</p>
          ) : (
            filtered.map((contact) => (
              <div key={contact._id} className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-medium">
                    {contact.name} {contact.surname}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    @{contact.username} · {contact.email}
                  </div>
                </div>
                {contact._id !== currentUserId && (
                  <>
                    <button
                      type="button"
                      disabled={busyId === contact._id}
                      onClick={() => handleMessage(contact)}
                      className="px-3 py-1 rounded bg-[var(--primary)] text-white text-sm disabled:opacity-50"
                    >
                      {busyId === contact._id ? 'Abriendo...' : 'Mensaje'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === `req-${contact._id}`}
                      onClick={() => handleContactRequest(contact)}
                      className="px-3 py-1 rounded border border-[var(--accent-soft)] text-sm"
                    >
                      Solicitar contacto
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ContactsPage
