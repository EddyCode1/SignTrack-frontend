import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { predictLetterFromFrame, translateSignText, checkRecognitionHealth } from '../../../shared/api/services/recognitionService'
import { getCallRoomConversation, sendTranslationMessage } from '../../../shared/api/services/chatService'
import { setSigningStatusHub } from '../../../shared/api/callsHubService'

const CAPTURE_INTERVAL_MS = 700
const STABLE_FRAMES = 4
const STABLE_FRAMES_HIGH_CONF = 2
const HIGH_CONFIDENCE = 0.72
const MIN_CONFIDENCE = 0.45
const MIN_APPEND_GAP_MS = 1400

/** Oculta stderr técnico de MediaPipe/Python y deja mensajes legibles. */
const humanizeRecognitionError = (raw) => {
  const text = String(raw || '')
  const jsonMatch = text.match(/\{"success"\s*:\s*false[^}]+\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      const code = String(parsed.error || parsed.message || '')
      if (/NO_HAND|MISSING_FEATURES|LANDMARK/i.test(code)) return ''
      return code
    } catch {
      /* ignore */
    }
  }
  if (/NO_HAND|MISSING_FEATURES|LANDMARK/i.test(text)) return ''
  if (/\.cc:\d+|TensorFlow Lite|MediaPipe|inference_feedback|landmark_projection|XNNPACK/i.test(text)) {
    return ''
  }
  if (text.length > 80) return 'Acerca la mano a la cámara con buena luz'
  return text
}

const SignLanguagePanel = ({
  conversationId: conversationIdProp,
  roomId,
  externalVideoRef,
  onMessageSent,
  autoStart = true,
}) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const lastLetterRef = useRef('')
  const stableCountRef = useRef(0)
  const lastAppendedAtRef = useRef(0)
  const errorShownRef = useRef(false)
  const autoStartedRef = useRef(false)
  const userStoppedRef = useRef(false)
  const startingCameraRef = useRef(false)

  const [conversationId, setConversationId] = useState(conversationIdProp || null)
  const [active, setActive] = useState(false)
  const [recognitionReady, setRecognitionReady] = useState(null)
  const [hybridEnabled, setHybridEnabled] = useState(false)
  const [lastError, setLastError] = useState('')
  const usesExternalVideo = Boolean(externalVideoRef)

  useEffect(() => {
    if (conversationIdProp) setConversationId(conversationIdProp)
  }, [conversationIdProp])

  useEffect(() => {
    if (!roomId || conversationIdProp) return
    let cancelled = false
    getCallRoomConversation(roomId)
      .then((conv) => {
        if (!cancelled) setConversationId(conv.id)
      })
      .catch(() => {
        /* El chat de llamada suele proveer conversationId desde CallSideChat */
      })
    return () => {
      cancelled = true
    }
  }, [roomId, conversationIdProp])

  const refreshRecognitionHealth = useCallback(async () => {
    try {
      const health = await checkRecognitionHealth()
      setRecognitionReady(true)
      setHybridEnabled(Boolean(health?.hybrid_enabled && health?.gemini_configured))
      return true
    } catch {
      setRecognitionReady(false)
      setHybridEnabled(false)
      return false
    }
  }, [])

  useEffect(() => {
    refreshRecognitionHealth()
    const poll = setInterval(refreshRecognitionHealth, 15000)
    return () => clearInterval(poll)
  }, [refreshRecognitionHealth])

  const getVideoElement = () => externalVideoRef?.current || videoRef.current
  const [loadingCamera, setLoadingCamera] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [lastLetter, setLastLetter] = useState('')
  const [lastSource, setLastSource] = useState('')
  const [lastConfidence, setLastConfidence] = useState(null)
  const [buffer, setBuffer] = useState('')
  const [sending, setSending] = useState(false)
  const [framesSeen, setFramesSeen] = useState(0)

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (!usesExternalVideo && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (!usesExternalVideo && videoRef.current) {
      videoRef.current.srcObject = null
    }
    setActive(false)
    setPredicting(false)
    lastLetterRef.current = ''
    stableCountRef.current = 0
    userStoppedRef.current = true
    startingCameraRef.current = false
  }, [usesExternalVideo])

  const captureFrame = () => {
    const video = getVideoElement()
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return null

    const width = video.videoWidth || 640
    const height = video.videoHeight || 480
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.save()
    if (!usesExternalVideo) {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, width, height)
    ctx.restore()
    return canvas.toDataURL('image/jpeg', 0.82)
  }

  const processFrame = useCallback(async () => {
    if (predicting) return
    const frame = captureFrame()
    if (!frame) return

    setPredicting(true)
    setFramesSeen((n) => n + 1)
    try {
      const result = await predictLetterFromFrame(frame)
      setLastError('')

      if (!result?.success) {
        const err = humanizeRecognitionError(result?.error || result?.message || 'Sin mano detectada')
        if (!err) {
          setLastLetter('—')
          return
        }
        setLastError(err)
        return
      }

      if (!result.label) return

      const letter = String(result.label).trim().toUpperCase()
      if (!letter) return

      const confidence =
        typeof result.confidence === 'number' && Number.isFinite(result.confidence)
          ? result.confidence
          : null

      if (confidence !== null && confidence < MIN_CONFIDENCE) {
        setLastLetter('—')
        setLastSource(result.source || '')
        setLastConfidence(confidence)
        return
      }

      setLastLetter(letter)
      setLastSource(result.source || 'local')
      setLastConfidence(confidence)

      const requiredStable =
        confidence !== null && confidence >= HIGH_CONFIDENCE ? STABLE_FRAMES_HIGH_CONF : STABLE_FRAMES

      if (letter === lastLetterRef.current) {
        stableCountRef.current += 1
      } else {
        lastLetterRef.current = letter
        stableCountRef.current = 1
      }

      if (stableCountRef.current >= requiredStable) {
        const now = Date.now()
        if (now - lastAppendedAtRef.current >= MIN_APPEND_GAP_MS) {
          setBuffer((prev) => {
            if (prev.endsWith(letter)) return prev
            return prev + letter
          })
          lastAppendedAtRef.current = now
        }
        stableCountRef.current = 0
      }
    } catch (err) {
      const raw =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Recognition no disponible'
      const msg = humanizeRecognitionError(raw)
      if (msg) setLastError(msg)
      if (msg && !errorShownRef.current) {
        errorShownRef.current = true
        toast.error(
          raw.includes('sign_model') || raw.includes('Model file')
            ? 'Falta el modelo IA. Ejecuta: pnpm setup:recognition'
            : `IA señas: ${msg}`,
          { duration: 6000 },
        )
      }
    } finally {
      setPredicting(false)
    }
  }, [])

  useEffect(() => {
    if (!autoStart || autoStartedRef.current || active || userStoppedRef.current) return
    if (!conversationId || recognitionReady !== true) return

    const tryAuto = () => {
      if (usesExternalVideo) {
        const video = getVideoElement()
        if (!video || video.readyState < 2) return false
      }
      autoStartedRef.current = true
      startCamera()
      return true
    }

    if (tryAuto()) return

    const poll = setInterval(() => {
      if (tryAuto()) clearInterval(poll)
    }, 500)

    return () => clearInterval(poll)
  }, [autoStart, active, conversationId, recognitionReady, usesExternalVideo, startCamera])

  const handleSend = async () => {
    const text = buffer.trim()
    if (!text) {
      toast.error('Firma algo antes de enviar')
      return
    }
    if (!conversationId) {
      toast.error('Conversación no disponible')
      return
    }
    setSending(true)
    try {
      const translated = await translateSignText(text)
      const finalText = String(translated?.text || text).trim() || text
      const msg = await sendTranslationMessage(conversationId, finalText)
      setBuffer('')
      setLastLetter('')
      setLastSource('')
      setLastConfidence(null)
      lastLetterRef.current = ''
      const provider = translated?.provider === 'gemini' ? ' (texto mejorado con IA)' : ''
      toast.success(`Seña enviada al chat${provider}`)
      onMessageSent?.(msg)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar traducción')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => () => stopCamera(), [stopCamera])

  // Avisa a los demás participantes de la sala (si esto vive dentro de una llamada)
  // que el panel de señas está activo, para que muestren un indicador en su tile.
  useEffect(() => {
    if (!roomId) return
    setSigningStatusHub(roomId, active)
  }, [roomId, active])

  useEffect(() => {
    if (!roomId) return
    return () => {
      setSigningStatusHub(roomId, false)
    }
  }, [roomId])

  return (
    <div className="card p-4 flex flex-col gap-3 border border-violet-400/30 bg-violet-500/5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Modo señas {autoStart && '(auto)'}</h3>
          <p className="text-xs text-[var(--muted)]">
            {usesExternalVideo
              ? 'IA integrada con la cámara de la llamada'
              : 'IA activa en cuanto hay cámara'}
          </p>
        </div>
        {!active ? (
          <button
            type="button"
            onClick={startCamera}
            disabled={loadingCamera || !conversationId}
            className="px-3 py-1.5 rounded bg-violet-600 text-white text-sm disabled:opacity-50"
          >
            {loadingCamera ? 'Abriendo...' : 'Activar'}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="px-3 py-1.5 rounded border border-[var(--accent-soft)] text-sm"
          >
            Detener
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-[10px]">
        <span
          className={`px-2 py-0.5 rounded-full ${
            recognitionReady === false
              ? 'bg-red-100 text-red-700'
              : recognitionReady
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          Recognition {recognitionReady === false ? 'offline' : recognitionReady ? 'OK' : '…'}
        </span>
        {active && (
          <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
            {predicting ? 'Analizando…' : `Frames ${framesSeen}`}
          </span>
        )}
        {hybridEnabled && (
          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
            Híbrido local + Gemini
          </span>
        )}
      </div>

      {!usesExternalVideo && (
        <div className="relative rounded-lg overflow-hidden bg-black/80 aspect-video max-h-48">
          <video ref={videoRef} className="w-full h-full object-cover mirror-video" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
          {!active && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
              {autoStart ? 'La cámara se activará sola…' : 'Vista previa de cámara'}
            </div>
          )}
          {predicting && (
            <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/50 text-white">
              Detectando...
            </span>
          )}
        </div>
      )}

      {usesExternalVideo && <canvas ref={canvasRef} className="hidden" />}

      {recognitionReady && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
          {hybridEnabled
            ? 'Modo híbrido: modelo local primero; si la confianza es baja, Gemini revisa el frame. Al enviar, el texto se corrige con IA.'
            : 'Modelo local activo. Para mejor precisión: entrena con pnpm recognition:letter-train o activa GEMINI_API_KEY + GEMINI_HYBRID_ENABLED.'}
        </p>
      )}

      {lastError && (
        <p className="text-xs text-red-600 bg-red-50 rounded p-2">{lastError}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-[var(--accent-soft)] p-2">
          <span className="text-xs text-[var(--muted)] block">Letra detectada</span>
          <span className="text-2xl font-bold text-violet-600">{lastLetter || '—'}</span>
          {(lastSource || lastConfidence !== null) && (
            <span className="text-[10px] text-[var(--muted)] block mt-1">
              {lastSource ? `Fuente: ${lastSource}` : ''}
              {lastConfidence !== null ? ` · ${Math.round(lastConfidence * 100)}%` : ''}
            </span>
          )}
        </div>
        <div className="rounded-lg border border-[var(--accent-soft)] p-2">
          <span className="text-xs text-[var(--muted)] block">Mensaje acumulado</span>
          <span className="font-medium break-all">{buffer || '—'}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setBuffer('')
            setLastLetter('')
            lastLetterRef.current = ''
          }}
          className="px-3 py-1.5 rounded border border-[var(--accent-soft)] text-sm flex-1"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !buffer.trim()}
          className="px-3 py-1.5 rounded bg-violet-600 text-white text-sm flex-1 disabled:opacity-50"
        >
          {sending ? 'Enviando...' : 'Enviar al chat'}
        </button>
      </div>
    </div>
  )
}

export default SignLanguagePanel
