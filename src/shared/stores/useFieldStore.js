import { create } from 'zustand'

const useFieldStore = create((set, get) => ({
  fields: [],
  loading: false,
  error: null,

  // Acciones
  setFields: (fields) => set({ fields }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // CRUD
  addField: (field) =>
    set((state) => ({
      fields: [...state.fields, { ...field, _id: Date.now().toString() }],
    })),

  updateField: (id, updatedField) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        field._id === id ? { ...field, ...updatedField } : field
      ),
    })),

  deleteField: (id) =>
    set((state) => ({
      fields: state.fields.filter((field) => field._id !== id),
    })),

  getFieldById: (id) => get().fields.find((field) => field._id === id),
}))

export default useFieldStore
