import { create } from 'zustand'

/**
 * Store de Contactos
 * Maneja el estado global de contactos
 */
export const useContactStore = create((set) => ({
  contacts: [],
  loading: false,

  // Establecer contactos
  setContacts: (contacts) => set({ contacts }),

  // Establecer estado de carga
  setLoading: (loading) => set({ loading }),

  // Agregar contacto
  addContact: (contact) =>
    set((state) => ({
      contacts: [...state.contacts, contact],
    })),

  // Actualizar contacto
  updateContact: (id, updatedContact) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact._id === id ? { ...contact, ...updatedContact } : contact
      ),
    })),

  // Eliminar contacto
  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact._id !== id),
    })),
}))
