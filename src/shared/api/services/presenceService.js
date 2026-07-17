import messagingClient from '../messagingClient'

export const getOnlineUserIds = async () => {
  const response = await messagingClient.get('/presence/online')
  return response.data?.userIds || []
}

export const sendPresenceHeartbeat = async () => {
  await messagingClient.post('/presence/heartbeat')
}
