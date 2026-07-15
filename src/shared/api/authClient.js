import axios from 'axios'
import useAuthStore from '../stores/useAuthStore'
import { APP_PATHS } from '../config/paths'

const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL || '/api/v1/auth',
  headers: {
    'Content-Type': 'application/json',
  },
})

authClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

authClient.interceptors.response.use(
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

export default authClient
