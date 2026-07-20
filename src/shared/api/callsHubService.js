import * as signalR from '@microsoft/signalr'
import useAuthStore from '../stores/useAuthStore'
import { createHubReconnectManager } from './hubReconnectManager'

const HUB_URL = import.meta.env.VITE_CALLS_HUB_URL || '/hubs/calls'

let sharedConnection = null
let connectionPromise = null
const joinedRooms = new Set()

const reconnectManager = createHubReconnectManager(() => getCallsHubConnection())
export const onCallsHubReconnecting = reconnectManager.onReconnecting
export const onCallsHubClosed = reconnectManager.onClosed

const getToken = () => useAuthStore.getState().getToken()

// El grupo call_{roomId} vive en el connectionId viejo: SignalR no lo restablece
// solo al reconectar (ni automático ni manual), así que reunimos las salas activas
// nosotros cuando la conexión vuelve.
const rejoinActiveRooms = async () => {
  if (!sharedConnection) return
  for (const roomId of joinedRooms) {
    try {
      await sharedConnection.invoke('JoinCallRoom', roomId)
    } catch {
      /* si la sala ya no existe o el usuario salió, se ignora */
    }
  }
}

export const getCallsHubConnection = async () => {
  if (sharedConnection?.state === signalR.HubConnectionState.Connected) {
    return sharedConnection
  }

  if (connectionPromise) return connectionPromise

  connectionPromise = (async () => {
    if (!sharedConnection) {
      sharedConnection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => getToken() || '',
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build()

      reconnectManager.wire(sharedConnection)
      sharedConnection.onreconnected(() => rejoinActiveRooms())
      reconnectManager.onClosed((closed) => {
        if (!closed) rejoinActiveRooms()
      })
    }

    if (sharedConnection.state === signalR.HubConnectionState.Disconnected) {
      await sharedConnection.start()
    }

    return sharedConnection
  })()

  try {
    return await connectionPromise
  } finally {
    connectionPromise = null
  }
}

export const joinCallRoomHub = async (roomId) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('JoinCallRoom', roomId)
  joinedRooms.add(roomId)
}

export const leaveCallRoomHub = async (roomId) => {
  joinedRooms.delete(roomId)
  if (!sharedConnection || sharedConnection.state !== signalR.HubConnectionState.Connected) return
  try {
    await sharedConnection.invoke('LeaveCallRoom', roomId)
  } catch {
    /* hub puede estar reconectando */
  }
}

export const inviteToCallHub = async (roomId, targetUserId) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('InviteToCall', roomId, targetUserId)
}

export const setSigningStatusHub = async (roomId, isSigning) => {
  if (!sharedConnection || sharedConnection.state !== signalR.HubConnectionState.Connected) return
  try {
    await sharedConnection.invoke('SetSigningStatus', roomId, isSigning)
  } catch {
    /* hub puede estar reconectando */
  }
}

export const onSigningStatusChanged = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('SigningStatusChanged', handler)
  return () => sharedConnection.off('SigningStatusChanged', handler)
}

// Se emite solo al unirse (JoinCallRoom), con quienes ya estaban firmando en ese
// momento — así quien llega tarde no se pierde el estado, que antes solo viajaba
// en el flanco de SetSigningStatus.
export const onExistingSigningStatuses = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('ExistingSigningStatuses', handler)
  return () => sharedConnection.off('ExistingSigningStatuses', handler)
}

export const sendOfferHub = async (roomId, targetUserId, sdp) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('SendOffer', roomId, targetUserId, sdp)
}

export const sendAnswerHub = async (roomId, targetUserId, sdp) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('SendAnswer', roomId, targetUserId, sdp)
}

export const sendIceCandidateHub = async (roomId, targetUserId, candidate) => {
  const hub = await getCallsHubConnection()
  await hub.invoke('SendIceCandidate', roomId, targetUserId, candidate)
}

export const onExistingParticipants = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('ExistingParticipants', handler)
  return () => sharedConnection.off('ExistingParticipants', handler)
}

export const onParticipantJoined = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('ParticipantJoined', handler)
  return () => sharedConnection.off('ParticipantJoined', handler)
}

export const onParticipantLeft = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('ParticipantLeft', handler)
  return () => sharedConnection.off('ParticipantLeft', handler)
}

export const onReceiveOffer = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('ReceiveOffer', handler)
  return () => sharedConnection.off('ReceiveOffer', handler)
}

export const onReceiveAnswer = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('ReceiveAnswer', handler)
  return () => sharedConnection.off('ReceiveAnswer', handler)
}

export const onReceiveIceCandidate = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('ReceiveIceCandidate', handler)
  return () => sharedConnection.off('ReceiveIceCandidate', handler)
}

// Llega en cualquier pantalla (grupo por-usuario del hub). Igual que los demás on*,
// requiere que getCallsHubConnection() haya creado la conexión antes de suscribirse.
export const onIncomingCall = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('IncomingCall', handler)
  return () => sharedConnection.off('IncomingCall', handler)
}

export const onRoomEnded = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('RoomEnded', handler)
  return () => sharedConnection.off('RoomEnded', handler)
}

export const disconnectCallsHub = async () => {
  if (sharedConnection) {
    await sharedConnection.stop()
    sharedConnection = null
    joinedRooms.clear()
  }
}
