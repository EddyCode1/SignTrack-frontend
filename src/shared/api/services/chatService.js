import messagingClient from '../messagingClient'

export const getConversations = async () => {
  const response = await messagingClient.get('/conversations')
  return response.data || []
}

export const createConversation = async ({ targetUserId, groupId, title }) => {
  const response = await messagingClient.post('/conversations', {
    targetUserId,
    groupId,
    title,
  })
  return response.data
}

export const getMessages = async (conversationId, cursor) => {
  const response = await messagingClient.get(`/conversations/${conversationId}/messages`, {
    params: cursor ? { cursor } : {},
  })
  return response.data
}

export const sendMessage = async (conversationId, content, type = 'text') => {
  const response = await messagingClient.post(`/conversations/${conversationId}/messages`, {
    content,
    type,
  })
  return response.data
}

export const sendTranslationMessage = async (conversationId, content) =>
  sendMessage(conversationId, content, 'translation')

export const getUnreadTotal = async () => {
  const response = await messagingClient.get('/conversations/unread-total')
  return response.data?.total ?? 0
}

export const getCallRoomConversation = async (roomId) => {
  const response = await messagingClient.post(`/conversations/call-room/${roomId}`)
  return response.data
}

export const markConversationRead = async (conversationId) => {
  await messagingClient.post(`/conversations/${conversationId}/read`)
}
