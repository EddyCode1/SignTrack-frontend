import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import {
  getCallRoomConversation,
  getMessages,
  sendMessage,
} from '../../../shared/api/services/chatService'
import {
  getChatHubConnection,
  joinConversationHub,
  leaveConversationHub,
  onReceiveMessage,
} from '../../../shared/api/chatHubService'

import { speakTranslation } from '../../../shared/utils/speakTranslation'

const CallSideChat = ({ roomId, onConversationReady }) => {
  const user = useAuthStore((s) => s.user)
  const currentUserId = user?.id || user?._id
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatError, setChatError] = useState('')
  const bottomRef = useRef(null)
  const errorToastShownRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      setLoading(true)
      try {
        const conv = await getCallRoomConversation(roomId)
        if (cancelled) return
        setConversationId(conv.id)
        onConversationReady?.(conv.id)
        const page = await getMessages(conv.id)
        if (!cancelled) setMessages(page.messages || [])

        await getChatHubConnection()
        if (!cancelled) await joinConversationHub(conv.id)
      } catch (err) {
        const msg = err.response?.data?.message || 'Chat de reunión no disponible'
        if (!cancelled) setChatError(msg)
        if (!cancelled && !errorToastShownRef.current) {
          errorToastShownRef.current = true
          toast.error(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
      if (conversationId) leaveConversationHub(conversationId).catch(() => {})
    }
  }, [roomId])

  useEffect(() => {
    if (!conversationId) return

    const off = onReceiveMessage((msg) => {
      if (msg.conversationId !== conversationId) return
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      if (msg.type === 'translation' && msg.senderUserId !== currentUserId) {
        speakTranslation(msg.content)
      }
    })

    return off
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !conversationId) return
    try {
      const msg = await sendMessage(conversationId, text.trim())
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      setText('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo enviar')
    }
  }

  if (loading) {
    return (
      <div className="card h-full p-4 text-sm text-[var(--muted)]">Cargando chat…</div>
    )
  }

  if (chatError) {
    return (
      <div className="card h-full p-4 text-sm text-red-600 bg-red-50">{chatError}</div>
    )
  }

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--accent-soft)] font-medium text-sm">
        Chat de reunión
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.length === 0 && (
          <p className="text-[var(--muted)]">Sin mensajes aún.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderUserId === currentUserId
          const isTranslation = m.type === 'translation'
          return (
            <div
              key={m.id}
              className={`max-w-[90%] px-2 py-1 rounded-lg ${
                mine
                  ? 'ml-auto bg-[var(--accent)] text-white'
                  : isTranslation
                    ? 'bg-violet-500/15 border border-violet-400/40'
                    : 'bg-[var(--surface)]'
              }`}
            >
              {isTranslation && (
                <span className="block text-[10px] uppercase opacity-70 mb-0.5">Señas</span>
              )}
              {m.content}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="p-2 border-t border-[var(--accent-soft)] flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 px-2 py-1 text-sm rounded border border-[var(--accent-soft)] bg-[var(--surface)]"
        />
        <button type="submit" className="btn-brand px-3 py-1 text-sm">
          Enviar
        </button>
      </form>
    </div>
  )
}

export default CallSideChat
