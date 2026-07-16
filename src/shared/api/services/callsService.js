import callsClient from '../callsClient'

export const getRooms = async () => {
  const response = await callsClient.get('/rooms')
  return response.data || []
}

export const createRoom = async ({ title, maxParticipants = 8 }) => {
  const response = await callsClient.post('/rooms', { title, maxParticipants })
  return response.data
}

export const getRoom = async (roomId) => {
  const response = await callsClient.get(`/rooms/${roomId}`)
  return response.data
}

export const joinRoom = async (roomId, displayName) => {
  const response = await callsClient.post(`/rooms/${roomId}/join`, { displayName })
  return response.data
}

export const endRoom = async (roomId) => {
  const response = await callsClient.post(`/rooms/${roomId}/end`)
  return response.data
}
