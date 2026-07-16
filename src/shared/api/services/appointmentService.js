import adminClient from '../adminClient'

export const getAppointments = async () => {
  const response = await adminClient.get('/appointments')
  return response.data || []
}

export const createAppointment = async (payload) => {
  const response = await adminClient.post('/appointments', payload)
  return response.data
}

export const linkAppointmentRoom = async (appointmentId, roomId) => {
  const response = await adminClient.post(`/appointments/${appointmentId}/link-room`, { roomId })
  return response.data
}
