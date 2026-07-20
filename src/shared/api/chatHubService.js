import * as signalR from '@microsoft/signalr'
import useAuthStore from '../stores/useAuthStore'
import { createHubReconnectManager } from './hubReconnectManager'

const HUB_URL = import.meta.env.VITE_CHAT_HUB_URL || '/hubs/chat'

let sharedConnection = null
let connectionPromise = null
let presenceJoined = false
const joinedConversations = new Set()

const reconnectManager = createHubReconnectManager(() => getChatHubConnection())
export const onChatHubReconnecting = reconnectManager.onReconnecting
export const onChatHubClosed = reconnectManager.onClosed

const getToken = () => useAuthStore.getState().getToken()

// Los grupos (presencia, conversaciones abiertas) viven en el connectionId viejo:
// SignalR no los restablece solo al reconectar (ni automático ni manual).
const rejoinGroups = async () => {
  if (!sharedConnection) return
  if (presenceJoined) {
    try {
      await sharedConnection.invoke('JoinPresence')
    } catch {
      /* se reintentará en el próximo ciclo de reconexión */
    }
  }
  for (const conversationId of joinedConversations) {
    try {
      await sharedConnection.invoke('JoinConversation', conversationId)
    } catch {
      /* la conversación puede haber dejado de existir */
    }
  }
}

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

      reconnectManager.wire(sharedConnection)
      sharedConnection.onreconnected(() => rejoinGroups())
      reconnectManager.onClosed((closed) => {
        if (!closed) rejoinGroups()
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

export const joinConversationHub = async (conversationId) => {
  const hub = await getChatHubConnection()
  await hub.invoke('JoinConversation', conversationId)
  joinedConversations.add(conversationId)
}

export const leaveConversationHub = async (conversationId) => {
  joinedConversations.delete(conversationId)
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
  presenceJoined = true
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
    presenceJoined = false
    joinedConversations.clear()
  }
}
