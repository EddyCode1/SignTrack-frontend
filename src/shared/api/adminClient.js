import axios from 'axios'
import useAuthStore from '../stores/useAuthStore'
import { APP_PATHS } from '../config/paths'

const adminClient = axios.create({
  baseURL: import.meta.env.VITE_IDENTITY_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

adminClient.interceptors.request.use(
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

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = APP_PATHS.login
    }
    return Promise.reject(error)
  }
)

export default adminClient
