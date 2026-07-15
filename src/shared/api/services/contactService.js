import adminClient from '../adminClient'
import { useContactStore } from '../../stores/useContactStore'
import toast from 'react-hot-toast'

/**
 * Servicio de Contactos
 * CRUD de contactos
 */

export const contactService = {
  // Obtener todos los contactos
  getContacts: async () => {
    try {
      useContactStore.getState().setLoading(true)
      const response = await adminClient.get('/contact')
      
      // El backend puede devolver un array directamente o dentro de un objeto
      let contactsData = []
      if (Array.isArray(response.data)) {
        contactsData = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        contactsData = response.data.data
      } else if (response.data?.contactos && Array.isArray(response.data.contactos)) {
        contactsData = response.data.contactos
      } else if (typeof response.data === 'object') {
        // Si es un objeto pero no tiene la estructura esperada, intenta obtener el array
        contactsData = Object.values(response.data).find(v => Array.isArray(v)) || []
      }
      
      useContactStore.getState().setContacts(contactsData)
      return { success: true, data: contactsData }
    } catch (error) {
      toast.error('Error al obtener contactos')
      return { success: false, error: error.message }
    } finally {
      useContactStore.getState().setLoading(false)
    }
  },

  // Crear contacto
  createContact: async (contactData) => {
    try {
      const response = await adminClient.post('/contact', contactData)
      useContactStore.getState().addContact(response.data)
      toast.success('Contacto creado exitosamente')
      return { success: true, data: response.data }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error al crear contacto'
      )
      return { success: false, error: error.message }
    }
  },

  // Actualizar contacto
  updateContact: async (id, contactData) => {
    try {
      const response = await adminClient.put(
        `/contact/${id}`,
        contactData
      )
      useContactStore.getState().updateContact(id, response.data)
      toast.success('Contacto actualizado exitosamente')
      return { success: true, data: response.data }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error al actualizar contacto'
      )
      return { success: false, error: error.message }
    }
  },

  // Eliminar contacto
  deleteContact: async (id) => {
    try {
      await adminClient.delete(`/contact/${id}`)
      useContactStore.getState().deleteContact(id)
      toast.success('Contacto eliminado exitosamente')
      return { success: true }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error al eliminar contacto'
      )
      return { success: false, error: error.message }
    }
  },
}
