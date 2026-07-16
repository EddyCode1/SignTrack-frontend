import axios from 'axios'
import useAuthStore from '../stores/useAuthStore'
import { APP_PATHS } from '../config/paths'

const messagingClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_MESSAGING_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

messagingClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

messagingClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname
      if (!path.startsWith(APP_PATHS.login) && !path.startsWith(APP_PATHS.register)) {
        useAuthStore.getState().logout()
        window.location.href = APP_PATHS.login
      }
    }
    return Promise.reject(error)
  }
)

export default messagingClient
