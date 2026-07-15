import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  setNotifications: (notifications) => set({ notifications }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  updateNotification: (id, updatedNotification) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification._id === id
          ? { ...notification, ...updatedNotification }
          : notification
      ),
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification._id !== id),
    })),

  getNotificationById: (id) => get().notifications.find((notification) => notification._id === id),
}))

export default useNotificationStore
