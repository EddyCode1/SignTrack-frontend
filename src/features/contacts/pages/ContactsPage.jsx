import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getContacts, getDirectory } from '../../../shared/api/services/userService'
import { createConversation } from '../../../shared/api/services/chatService'
import { createRequest } from '../../../shared/api/services/requestService'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { useOnlinePresence } from '../../../app/providers/PresenceProvider'

const ContactsPage = () => {
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id || s.user?._id)
  const onlineIds = useOnlinePresence()

  const [contacts, setContacts] = useState([])
  const [contactsQuery, setContactsQuery] = useState('')
  const [loadingContacts, setLoadingContacts] = useState(true)

  const [showDirectory, setShowDirectory] = useState(false)
  const [directory, setDirectory] = useState([])
  const [directoryQuery, setDirectoryQuery] = useState('')
  const [loadingDirectory, setLoadingDirectory] = useState(false)
  const [directoryLoaded, setDirectoryLoaded] = useState(false)

  const [busyId, setBusyId] = useState(null)

  const loadContacts = async () => {
    setLoadingContacts(true)
    try {
      setContacts(await getContacts(''))
    } catch {
      toast.error('Error al cargar contactos')
    } finally {
      setLoadingContacts(false)
    }
  }

  const loadDirectory = async (search = directoryQuery) => {
    setLoadingDirectory(true)
    try {
      setDirectory(await getDirectory(search))
      setDirectoryLoaded(true)
    } catch {
      toast.error('Error al cargar el directorio')
    } finally {
      setLoadingDirectory(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  useEffect(() => {
    if (showDirectory && !directoryLoaded) {
      loadDirectory('')
    }
  }, [showDirectory])

  const contactIds = useMemo(() => new Set(contacts.map((c) => c._id)), [contacts])

  const filteredContacts = useMemo(() => {
    if (!contactsQuery.trim()) return contacts
    const term = contactsQuery.toLowerCase()
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.surname?.toLowerCase().includes(term) ||
        c.username?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
    )
  }, [contacts, contactsQuery])

  const handleDirectorySearch = (e) => {
    e.preventDefault()
    loadDirectory(directoryQuery)
  }

  const handleMessage = async (user) => {
    setBusyId(user._id)
    try {
      const chat = await createConversation({ targetUserId: user._id })
      navigate(`/dashboard/chats/${chat.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo abrir el chat')
    } finally {
      setBusyId(null)
    }
  }

  const handleContactRequest = async (user) => {
    setBusyId(`req-${user._id}`)
    try {
      await createRequest({
        type: 'contact',
        toUserId: user._id,
        message: 'Solicitud de contacto',
      })
      toast.success('Solicitud enviada')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar solicitud')
    } finally {
      setBusyId(null)
    }
  }

  const renderUserInfo = (user) => (
    <div className="flex-1 min-w-[200px] flex items-center gap-2">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
          onlineIds.has(user._id) ? 'bg-green-500' : 'bg-gray-300'
        }`}
        title={onlineIds.has(user._id) ? 'En línea' : 'Desconectado'}
      />
      <div>
        <div className="font-medium">
          {user.name} {user.surname}
        </div>
        <div className="text-sm text-[var(--muted)]">
          @{user.username} · {user.email}
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Contactos</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Tus contactos aceptados y el directorio para encontrar nuevas personas.
      </p>

      {/* Mis contactos */}
      <h2 className="text-lg font-semibold mb-3">Mis contactos</h2>
      <div className="card p-4 mb-4 flex gap-3">
        <input
          value={contactsQuery}
          onChange={(e) => setContactsQuery(e.target.value)}
          placeholder="Filtrar mis contactos..."
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
        />
      </div>

      {loadingContacts ? (
        <p className="text-[var(--muted)] mb-6">Cargando contactos...</p>
      ) : (
        <div className="card divide-y divide-[var(--accent-soft)] mb-8">
          {filteredContacts.length === 0 ? (
            <p className="p-6 text-[var(--muted)]">
              {contacts.length === 0
                ? 'Aún no tienes contactos. Busca personas abajo y envíales una solicitud.'
                : 'Ningún contacto coincide con la búsqueda.'}
            </p>
          ) : (
            filteredContacts.map((contact) => (
              <div key={contact._id} className="p-4 flex flex-wrap items-center gap-3">
                {renderUserInfo(contact)}
                <button
                  type="button"
                  disabled={busyId === contact._id}
                  onClick={() => handleMessage(contact)}
                  className="px-3 py-1 rounded bg-[var(--primary)] text-white text-sm disabled:opacity-50"
                >
                  {busyId === contact._id ? 'Abriendo...' : 'Mensaje'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Buscar personas */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Buscar personas</h2>
        <button
          type="button"
          onClick={() => setShowDirectory((v) => !v)}
          className="px-3 py-1 rounded border border-[var(--accent-soft)] text-sm"
        >
          {showDirectory ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {showDirectory && (
        <>
          <form onSubmit={handleDirectorySearch} className="card p-4 mb-4 flex gap-3">
            <input
              value={directoryQuery}
              onChange={(e) => setDirectoryQuery(e.target.value)}
              placeholder="Buscar por nombre, usuario o email..."
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
            />
            <button type="submit" className="btn-brand px-4">Buscar</button>
          </form>

          {loadingDirectory ? (
            <p className="text-[var(--muted)]">Cargando directorio...</p>
          ) : (
            <div className="card divide-y divide-[var(--accent-soft)]">
              {directory.length === 0 ? (
                <p className="p-6 text-[var(--muted)]">No se encontraron personas.</p>
              ) : (
                directory.map((person) => (
                  <div key={person._id} className="p-4 flex flex-wrap items-center gap-3">
                    {renderUserInfo(person)}
                    {person._id !== currentUserId && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === person._id}
                          onClick={() => handleMessage(person)}
                          className="px-3 py-1 rounded bg-[var(--primary)] text-white text-sm disabled:opacity-50"
                        >
                          {busyId === person._id ? 'Abriendo...' : 'Mensaje'}
                        </button>
                        {contactIds.has(person._id) ? (
                          <span className="px-3 py-1 text-sm text-[var(--muted)]">
                            Ya es tu contacto
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={busyId === `req-${person._id}`}
                            onClick={() => handleContactRequest(person)}
                            className="px-3 py-1 rounded border border-[var(--accent-soft)] text-sm"
                          >
                            Solicitar contacto
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ContactsPage
