import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getMessages, markConversationRead, sendMessage } from '../../../shared/api/services/chatService'
import {
  getChatHubConnection,
  joinConversationHub,
  leaveConversationHub,
  onReceiveMessage,
  onUserTyping,
  sendTypingHub,
} from '../../../shared/api/chatHubService'
import SignLanguagePanel from '../components/SignLanguagePanel'
import { speakTranslation } from '../../../shared/utils/speakTranslation'
import { APP_ROUTES } from '../../../shared/config/paths'

const ChatRoomPage = () => {
  const { conversationId } = useParams()
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = currentUser?.id || currentUser?._id
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hubReady, setHubReady] = useState(false)
  const [typingUserId, setTypingUserId] = useState(null)
  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const typingClearRef = useRef(null)

  const appendMessage = (msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }

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
    markConversationRead(conversationId).catch(() => {})
  }, [conversationId])

  useEffect(() => {
    let cancelled = false

    const setupHub = async () => {
      try {
        await getChatHubConnection()
        if (cancelled) return
        await joinConversationHub(conversationId)
        if (!cancelled) setHubReady(true)
      } catch (err) {
        console.error('SignalR:', err)
        toast.error('Chat en vivo no disponible; usa Actualizar para ver mensajes nuevos.')
      }
    }

    setupHub()

    const offMessage = onReceiveMessage((msg) => {
      if (msg.conversationId === conversationId) {
        appendMessage(msg)
        if (msg.type === 'translation' && msg.senderUserId !== currentUserId) {
          speakTranslation(msg.content)
        }
      }
    })

    const offTyping = onUserTyping(({ conversationId: cid, userId, isTyping }) => {
      if (cid !== conversationId || userId === currentUserId) return
      if (isTyping) {
        setTypingUserId(userId)
        clearTimeout(typingClearRef.current)
        typingClearRef.current = setTimeout(() => setTypingUserId(null), 3000)
      } else {
        setTypingUserId(null)
      }
    })

    return () => {
      cancelled = true
      offMessage()
      offTyping()
      leaveConversationHub(conversationId)
      setHubReady(false)
      clearTimeout(typingTimeoutRef.current)
      clearTimeout(typingClearRef.current)
    }
  }, [conversationId, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUserId])

  const handleTextChange = (value) => {
    setText(value)
    if (!hubReady) return

    sendTypingHub(conversationId, value.length > 0)
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingHub(conversationId, false)
    }, 1200)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setSending(true)
    try {
      await sendTypingHub(conversationId, false)
      const msg = await sendMessage(conversationId, content)
      appendMessage(msg)
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
        <span className={`text-xs px-2 py-0.5 rounded-full ${hubReady ? 'bg-green-500/15 text-green-700' : 'bg-amber-500/15 text-amber-700'}`}>
          {hubReady ? 'En vivo' : 'Conectando...'}
        </span>
        <button
          type="button"
          onClick={loadMessages}
          className="ml-auto text-sm text-[var(--muted)] hover:text-[var(--text)]"
        >
          Actualizar
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0">
      <div className="card flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {loading ? (
          <p className="text-[var(--muted)]">Cargando...</p>
        ) : messages.length === 0 ? (
          <p className="text-[var(--muted)]">Escribe el primer mensaje.</p>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderUserId === currentUserId
            const isTranslation = msg.type === 'translation'
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    mine
                      ? 'bg-[var(--primary)] text-white'
                      : isTranslation
                        ? 'bg-violet-500/15 text-[var(--text)] border border-violet-400/40'
                        : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--accent-soft)]'
                  }`}
                >
                  {isTranslation && (
                    <span className="block text-[10px] uppercase tracking-wide opacity-70 mb-1">
                      Traducción señas
                    </span>
                  )}
                  {msg.content}
                </div>
              </div>
            )
          })
        )}
        {typingUserId && (
          <p className="text-xs text-[var(--muted)] italic">Alguien está escribiendo...</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-brand px-4">
          {sending ? '...' : 'Enviar'}
        </button>
      </form>
        </div>

        <div className="lg:w-80 shrink-0">
          <SignLanguagePanel conversationId={conversationId} onMessageSent={appendMessage} />
        </div>
      </div>
    </div>
  )
}

export default ChatRoomPage
