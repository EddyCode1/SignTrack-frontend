import * as signalR from '@microsoft/signalr'
import useAuthStore from '../stores/useAuthStore'

const HUB_URL = import.meta.env.VITE_CHAT_HUB_URL || '/hubs/chat'

let sharedConnection = null
let connectionPromise = null

const getToken = () => useAuthStore.getState().getToken()

export const getChatHubConnection = async () => {
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

export const joinConversationHub = async (conversationId) => {
  const hub = await getChatHubConnection()
  await hub.invoke('JoinConversation', conversationId)
}

export const leaveConversationHub = async (conversationId) => {
  if (!sharedConnection || sharedConnection.state !== signalR.HubConnectionState.Connected) return
  try {
    await sharedConnection.invoke('LeaveConversation', conversationId)
  } catch {
    /* hub puede estar reconectando */
  }
}

export const sendTypingHub = async (conversationId, isTyping) => {
  if (!sharedConnection || sharedConnection.state !== signalR.HubConnectionState.Connected) return
  try {
    await sharedConnection.invoke('SendTyping', conversationId, isTyping)
  } catch {
    /* ignore */
  }
}

export const onReceiveMessage = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('ReceiveMessage', handler)
  return () => sharedConnection.off('ReceiveMessage', handler)
}

export const onUserTyping = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('UserTyping', handler)
  return () => sharedConnection.off('UserTyping', handler)
}

export const joinPresenceHub = async () => {
  const hub = await getChatHubConnection()
  await hub.invoke('JoinPresence')
}

export const onUserPresenceChanged = (handler) => {
  if (!sharedConnection) return () => {}
  sharedConnection.on('UserPresenceChanged', handler)
  return () => sharedConnection.off('UserPresenceChanged', handler)
}

export const disconnectChatHub = async () => {
  if (sharedConnection) {
    await sharedConnection.stop()
    sharedConnection = null
  }
}
