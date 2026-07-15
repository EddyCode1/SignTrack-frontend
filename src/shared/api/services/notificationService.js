import adminClient from '../../api/adminClient'
import toast from 'react-hot-toast'

const resource = '/notifications'

const normalizeNotificationResponse = (payload) => {
  if (Array.isArray(payload)) return payload
  if (payload?.notifications && Array.isArray(payload.notifications)) return payload.notifications
  if (payload?.data && Array.isArray(payload.data)) return payload.data
  return []
}

const notificationService = {
  getNotifications: async (params = {}) => {
    try {
      const response = await adminClient.get(resource, { params })
      return normalizeNotificationResponse(response.data?.data ?? response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cargando notificaciones')
      return []
    }
  },

  createNotification: async (notificationData) => {
    try {
      const response = await adminClient.post(resource, notificationData)
      toast.success('Notificación creada correctamente')
      return response.data?.data ?? response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear notificación')
      return null
    }
  },

  updateNotification: async (id, notificationData) => {
    try {
      const response = await adminClient.put(`${resource}/${id}`, notificationData)
      toast.success('Notificación actualizada correctamente')
      return response.data?.data ?? response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar notificación')
      return null
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await adminClient.delete(`${resource}/${id}`)
      toast.success('Notificación eliminada')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar notificación')
      return null
    }
  },
}

export default notificationService
