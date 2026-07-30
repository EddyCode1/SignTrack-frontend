import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { endRoom } from '../../../shared/api/services/callsService'
import {
  getCallsHubConnection,
  joinCallRoomHub,
  leaveCallRoomHub,
  onCallsHubReconnecting,
  onExistingParticipants,
  onParticipantJoined,
  onParticipantLeft,
  onExistingSigningStatuses,
  onReceiveAnswer,
  onReceiveIceCandidate,
  onReceiveOffer,
  onSigningStatusChanged,
  sendAnswerHub,
  sendIceCandidateHub,
  sendOfferHub,
} from '../../../shared/api/callsHubService'
import { APP_ROUTES } from '../../../shared/config/paths'
import CallSideChat from './CallSideChat'
import InviteToCallPanel from './InviteToCallPanel'
import SignLanguagePanel from '../../chats/components/SignLanguagePanel'

const RemoteVideoTile = ({ stream, label, isSigning }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="card aspect-video overflow-hidden bg-black relative">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
        {label}
      </span>
      {isSigning && (
        <span className="absolute top-2 left-2 text-xs bg-violet-600 text-white px-2 py-1 rounded-full">
          Firmando
        </span>
      )}
    </div>
  )
}

const MeshCallRoom = ({
  room,
  roomId,
  currentUserId,
  iceServers,
  onLeave,
}) => {
  const [hubReady, setHubReady] = useState(false)
  const [hubReconnecting, setHubReconnecting] = useState(false)
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [sideChatOpen, setSideChatOpen] = useState(true)
  const [callConversationId, setCallConversationId] = useState(null)
  const [signingUsers, setSigningUsers] = useState({})

  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionsRef = useRef(new Map())
  const iceServersRef = useRef(iceServers || [])
  const makingOfferRef = useRef(new Set())

  const stopLocalMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
  }, [])

  const closePeerConnection = useCallback((remoteUserId) => {
    const pc = peerConnectionsRef.current.get(remoteUserId)
    if (pc) {
      pc.close()
      peerConnectionsRef.current.delete(remoteUserId)
    }
    makingOfferRef.current.delete(remoteUserId)
    setRemoteStreams((prev) => {
      if (!prev[remoteUserId]) return prev
      const next = { ...prev }
      delete next[remoteUserId]
      return next
    })
  }, [])

  const closeAllPeers = useCallback(() => {
    peerConnectionsRef.current.forEach((pc) => pc.close())
    peerConnectionsRef.current.clear()
    makingOfferRef.current.clear()
    setRemoteStreams({})
  }, [])

  const getOrCreatePeerConnection = useCallback(
    (remoteUserId) => {
      let pc = peerConnectionsRef.current.get(remoteUserId)
      if (pc) return pc

      pc = new RTCPeerConnection({ iceServers: iceServersRef.current })

      const stream = localStreamRef.current
      if (stream) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidateHub(roomId, remoteUserId, event.candidate.toJSON()).catch(() => {})
        }
      }

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams
        if (remoteStream) {
          setRemoteStreams((prev) => ({ ...prev, [remoteUserId]: remoteStream }))
        }
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          closePeerConnection(remoteUserId)
        }
      }

      peerConnectionsRef.current.set(remoteUserId, pc)
      return pc
    },
    [roomId, closePeerConnection]
  )

  const createAndSendOffer = useCallback(
    async (remoteUserId) => {
      if (!remoteUserId || remoteUserId === currentUserId) return
      if (makingOfferRef.current.has(remoteUserId)) return

      makingOfferRef.current.add(remoteUserId)
      try {
        const pc = getOrCreatePeerConnection(remoteUserId)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        await sendOfferHub(roomId, remoteUserId, pc.localDescription)
      } catch (err) {
        console.error('Offer:', err)
        closePeerConnection(remoteUserId)
      } finally {
        makingOfferRef.current.delete(remoteUserId)
      }
    },
    [roomId, currentUserId, getOrCreatePeerConnection, closePeerConnection]
  )

  const handleRemoteOffer = useCallback(
    async ({ roomId: rid, fromUserId, targetUserId, sdp }) => {
      if (rid !== roomId || targetUserId !== currentUserId) return

      try {
        const pc = getOrCreatePeerConnection(fromUserId)
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        await sendAnswerHub(roomId, fromUserId, pc.localDescription)
      } catch (err) {
        console.error('Answer:', err)
        closePeerConnection(fromUserId)
      }
    },
    [roomId, currentUserId, getOrCreatePeerConnection, closePeerConnection]
  )

  const handleRemoteAnswer = useCallback(
    async ({ roomId: rid, fromUserId, targetUserId, sdp }) => {
      if (rid !== roomId || targetUserId !== currentUserId) return

      const pc = peerConnectionsRef.current.get(fromUserId)
      if (!pc) return

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      } catch (err) {
        console.error('Remote answer:', err)
      }
    },
    [roomId, currentUserId]
  )

  const handleRemoteIce = useCallback(
    async ({ roomId: rid, fromUserId, targetUserId, candidate }) => {
      if (rid !== roomId || targetUserId !== currentUserId) return

      const pc = peerConnectionsRef.current.get(fromUserId)
      if (!pc || !candidate) return

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.error('ICE:', err)
      }
    },
    [roomId, currentUserId]
  )

  useEffect(() => {
    iceServersRef.current = iceServers || []
  }, [iceServers])

  useEffect(() => {
    let cancelled = false

    const initMediaAndHub = async () => {
      try {
        let stream
        let noCameraDetected = false
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        } catch (mediaErr) {
          const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [])
          const hasCamera = devices.some((d) => d.kind === 'videoinput')

          if (!hasCamera) {
            noCameraDetected = true
            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
          } else if (mediaErr.name === 'OverconstrainedError' || mediaErr.name === 'ConstraintNotSatisfiedError') {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 320 }, height: { ideal: 240 } },
              audio: true,
            })
          } else {
            throw mediaErr
          }
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        if (noCameraDetected) {
          toast('No se detectó cámara en este dispositivo — entrando solo con audio.', { icon: '🎙️' })
        }

        await getCallsHubConnection()
        if (cancelled) return
        await joinCallRoomHub(roomId)
        if (!cancelled) setHubReady(true)
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          toast.error('Permite acceso a cámara y micrófono para la videollamada.')
        } else if (err.name === 'NotFoundError') {
          toast.error('No se encontró cámara o micrófono en este dispositivo.')
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          toast.error('La cámara está en uso por otra pestaña o aplicación.')
        } else if (err.name) {
          toast.error(`No se pudo acceder a la cámara/micrófono (${err.name}: ${err.message})`)
        } else {
          toast.error(err.response?.data?.message || err.message || 'No se pudo iniciar la llamada')
        }
      }
    }

    initMediaAndHub()

    return () => {
      cancelled = true
      leaveCallRoomHub(roomId).catch(() => {})
      closeAllPeers()
      stopLocalMedia()
    }
  }, [roomId, closeAllPeers, stopLocalMedia])

  useEffect(() => {
    const offReconnect = onCallsHubReconnecting(setHubReconnecting)

    const offExisting = onExistingParticipants(({ roomId: rid, userIds }) => {
      if (rid !== roomId) return
      userIds.forEach((uid) => createAndSendOffer(uid))
    })

    const offJoined = onParticipantJoined(({ roomId: rid, userId }) => {
      if (rid !== roomId || userId === currentUserId) return
    })

    const offLeft = onParticipantLeft(({ roomId: rid, userId }) => {
      if (rid !== roomId) return
      closePeerConnection(userId)
    })

    const offOffer = onReceiveOffer(handleRemoteOffer)
    const offAnswer = onReceiveAnswer(handleRemoteAnswer)
    const offIce = onReceiveIceCandidate(handleRemoteIce)

    const offSigning = onSigningStatusChanged(({ roomId: rid, userId, isSigning }) => {
      if (rid !== roomId) return
      setSigningUsers((prev) => ({ ...prev, [userId]: isSigning }))
    })

    const offExistingSigning = onExistingSigningStatuses(({ roomId: rid, userIds }) => {
      if (rid !== roomId) return
      setSigningUsers((prev) => {
        const next = { ...prev }
        userIds.forEach((userId) => {
          next[userId] = true
        })
        return next
      })
    })

    return () => {
      offReconnect()
      offExisting()
      offJoined()
      offLeft()
      offOffer()
      offAnswer()
      offIce()
      offSigning()
      offExistingSigning()
    }
  }, [
    roomId,
    currentUserId,
    createAndSendOffer,
    closePeerConnection,
    handleRemoteOffer,
    handleRemoteAnswer,
    handleRemoteIce,
  ])

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMuted(!track.enabled)
  }

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setVideoOff(!track.enabled)
  }

  const handleLeave = async () => {
    await leaveCallRoomHub(roomId)
    closeAllPeers()
    stopLocalMedia()
    onLeave()
  }

  const handleEnd = async () => {
    try {
      await endRoom(roomId)
      toast.success('Reunión terminada')
      await handleLeave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo terminar')
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/signtrack/dashboard/calls/${roomId}`
    navigator.clipboard.writeText(url)
    toast.success('Enlace copiado')
  }

  const remoteEntries = Object.entries(remoteStreams)
  const isHost = room.hostUserId === currentUserId

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Link to={APP_ROUTES.dashboardCalls} className="text-[var(--accent)] hover:underline">
          ← Reuniones
        </Link>
        <h1 className="text-xl font-bold flex-1">{room.title}</h1>
        {hubReconnecting ? (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
            Reconectando hub…
          </span>
        ) : hubReady ? (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">En vivo</span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Conectando…</span>
        )}
        <button type="button" onClick={copyLink} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
          Copiar enlace
        </button>
        <button
          type="button"
          onClick={() => setSideChatOpen((v) => !v)}
          className="px-3 py-1 rounded border border-[var(--accent-soft)]"
        >
          {sideChatOpen ? 'Ocultar panel' : 'Chat / Señas'}
        </button>
        <button type="button" onClick={toggleMute} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
          {muted ? 'Activar mic' : 'Silenciar'}
        </button>
        <button type="button" onClick={toggleVideo} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
          {videoOff ? 'Encender cámara' : 'Apagar cámara'}
        </button>
        <button type="button" onClick={handleLeave} className="px-3 py-1 rounded border border-[var(--accent-soft)]">
          Salir
        </button>
        {isHost && <InviteToCallPanel roomId={roomId} />}
        {isHost && (
          <button type="button" onClick={handleEnd} className="px-3 py-1 rounded bg-red-600 text-white">
            Terminar
          </button>
        )}
      </div>

      <p className="text-sm text-[var(--muted)] mb-4">
        Videollamada WebRTC · Participantes: {room.participantCount}
      </p>

      <div className="flex flex-col lg:flex-row gap-4 min-h-0">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className="card aspect-video overflow-hidden bg-black relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
              Tú {muted && '· Mic off'} {videoOff && '· Cam off'}
            </span>
          </div>

          {remoteEntries.map(([userId, stream]) => {
            const participant = room.participants?.find((p) => p.userId === userId)
            return (
              <RemoteVideoTile
                key={userId}
                stream={stream}
                label={participant?.displayName || userId}
                isSigning={Boolean(signingUsers[userId])}
              />
            )
          })}

          {remoteEntries.length === 0 && (
            <div className="card aspect-video flex flex-col items-center justify-center bg-[var(--surface)]">
              <span className="text-[var(--muted)]">Esperando a otro participante…</span>
              <span className="text-xs text-[var(--muted)] mt-2">Comparte el enlace de la reunión</span>
            </div>
          )}
        </div>

        {sideChatOpen && (
          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-4 min-h-[320px]">
            <div className="min-h-[200px] flex-1">
              <CallSideChat roomId={roomId} onConversationReady={setCallConversationId} />
            </div>
            {callConversationId ? (
              <SignLanguagePanel
                conversationId={callConversationId}
                roomId={roomId}
                externalVideoRef={localVideoRef}
                autoStart={false}
              />
            ) : (
              <div className="card p-4 text-xs text-[var(--muted)]">Esperando chat de reunión…</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MeshCallRoom
