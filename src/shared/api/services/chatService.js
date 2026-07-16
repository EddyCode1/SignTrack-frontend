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

export const sendMessage = async (conversationId, content) => {
  const response = await messagingClient.post(`/conversations/${conversationId}/messages`, {
    content,
    type: 'text',
  })
  return response.data
}
