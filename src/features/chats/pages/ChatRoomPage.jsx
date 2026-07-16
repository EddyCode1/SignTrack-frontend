import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getMessages, sendMessage } from '../../../shared/api/services/chatService'
import { APP_ROUTES } from '../../../shared/config/paths'

const ChatRoomPage = () => {
  const { conversationId } = useParams()
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?.id || currentUser?._id
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const page = await getMessages(conversationId)
      setMessages(page.messages || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cargar mensajes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setSending(true)
    try {
      const msg = await sendMessage(conversationId, content)
      setMessages((prev) => [...prev, msg])
      setText('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center gap-3">
        <Link to={APP_ROUTES.dashboardChats} className="text-[var(--accent)] hover:underline">
          ← Chats
        </Link>
        <h1 className="text-xl font-bold text-[var(--text)]">Conversación</h1>
        <button
          type="button"
          onClick={loadMessages}
          className="ml-auto text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          Actualizar
        </button>
      </div>

      <div className="card flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-[var(--muted)]">Cargando...</p>
        ) : messages.length === 0 ? (
          <p className="text-[var(--muted)]">Escribe el primer mensaje.</p>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderUserId === currentUserId
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    mine
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--accent-soft)]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-brand px-4">
          {sending ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}

export default ChatRoomPage
