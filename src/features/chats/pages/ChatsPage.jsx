import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getConversations } from '../../../shared/api/services/chatService'
import { APP_ROUTES } from '../../../shared/config/paths'

const buildChatPath = (id) => `/dashboard/chats/${id}`

const ChatsPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConversations()
      .then(setItems)
      .catch((err) => {
        toast.error(err.response?.data?.message || 'No se pudo cargar los chats')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Cargando chats...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">Chats</h1>
      {items.length === 0 ? (
        <div className="card p-6 text-[var(--muted)]">
          Aún no tienes conversaciones. Abre un chat desde un grupo o contacto.
        </div>
      ) : (
        <ul className="card divide-y divide-[var(--accent-soft)]">
          {items.map((chat) => (
            <li key={chat.id}>
              <Link
                to={buildChatPath(chat.id)}
                className="block px-4 py-3 hover:bg-[var(--surface)] transition"
              >
                <div className="font-medium text-[var(--text)]">
                  {chat.title || (chat.type === 'group' ? `Grupo ${chat.groupId}` : 'Chat directo')}
                </div>
                <div className="text-sm text-[var(--muted)] truncate">
                  {chat.lastMessagePreview || 'Sin mensajes'}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ChatsPage
