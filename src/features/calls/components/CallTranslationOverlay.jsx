import { useEffect, useState } from 'react'
import { onReceiveMessage } from '../../../shared/api/chatHubService'

const CallTranslationOverlay = ({ conversationId }) => {
  const [subtitle, setSubtitle] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!conversationId) return

    let hideTimer = null

    const off = onReceiveMessage((msg) => {
      if (msg.conversationId !== conversationId || msg.type !== 'translation') return
      setSubtitle(msg.content)
      setVisible(true)
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => setVisible(false), 8000)
    })

    return () => {
      off()
      clearTimeout(hideTimer)
    }
  }, [conversationId])

  if (!visible || !subtitle) return null

  return (
    <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 z-20 max-w-[90%]">
      <div className="px-4 py-2 rounded-lg bg-black/75 text-white text-center text-sm shadow-lg border border-violet-400/50">
        <span className="block text-[10px] uppercase tracking-wide text-violet-300 mb-0.5">
          Traducción señas
        </span>
        {subtitle}
      </div>
    </div>
  )
}

export default CallTranslationOverlay
