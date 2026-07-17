import * as signalR from '@microsoft/signalr'
import useAuthStore from '../stores/useAuthStore'

const HUB_URL = import.meta.env.VITE_CALLS_HUB_URL || '/hubs/calls'

let sharedConnection = null
let connectionPromise = null
const reconnectHandlers = new Set()

export const onCallsHubReconnecting = (handler) => {
  reconnectHandlers.add(handler)
  return () => reconnectHandlers.delete(handler)
}

const getToken = () => useAuthStore.getState().getToken()

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

      sharedConnection.onreconnecting(() => {
        reconnectHandlers.forEach((h) => h(true))
      })
      sharedConnection.onreconnected(() => {
        reconnectHandlers.forEach((h) => h(false))
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
}

export const leaveCallRoomHub = async (roomId) => {
  if (!sharedConnection || sharedConnection.state !== signalR.HubConnectionState.Connected) return
  try {
    await sharedConnection.invoke('LeaveCallRoom', roomId)
  } catch {
    /* hub puede estar reconectando */
  }
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

export const onRoomEnded = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('RoomEnded', handler)
  return () => sharedConnection.off('RoomEnded', handler)
}

export const disconnectCallsHub = async () => {
  if (sharedConnection) {
    await sharedConnection.stop()
    sharedConnection = null
  }
}
