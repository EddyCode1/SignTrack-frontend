import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (token, user, refreshToken = null) =>
        set({ token, user, refreshToken, isAuthenticated: true }),
      setTokens: (token, refreshToken = null) => set({ token, refreshToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null, refreshToken: null, isAuthenticated: false }),

      getToken: () => get().token,
      getUser: () => get().user,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore