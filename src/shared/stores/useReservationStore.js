import { create } from 'zustand'

const useReservationStore = create((set, get) => ({
  reservations: [],
  loading: false,
  error: null,

  setReservations: (reservations) => set({ reservations }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addReservation: (reservation) =>
    set((state) => ({
      reservations: [...state.reservations, reservation],
    })),

  updateReservation: (id, updatedReservation) =>
    set((state) => ({
      reservations: state.reservations.map((reservation) =>
        reservation._id === id
          ? { ...reservation, ...updatedReservation }
          : reservation
      ),
    })),

  deleteReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((reservation) => reservation._id !== id),
    })),

  getReservationById: (id) => get().reservations.find((reservation) => reservation._id === id),
}))

export default useReservationStore
