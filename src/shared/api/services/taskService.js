import adminClient from '../adminClient'

export const getTasks = async (params = {}) => {
  const response = await adminClient.get('/tasks', { params })
  return response.data || []
}

export const createTask = async (payload) => {
  const response = await adminClient.post('/tasks', payload)
  return response.data
}

export const updateTask = async (taskId, payload) => {
  const response = await adminClient.put(`/tasks/${taskId}`, payload)
  return response.data
}

export const deleteTask = async (taskId) => {
  await adminClient.delete(`/tasks/${taskId}`)
}
