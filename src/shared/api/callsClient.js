import axios from 'axios'
import useAuthStore from '../stores/useAuthStore'
import { APP_PATHS } from '../config/paths'

const callsClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_CALLS_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

callsClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

callsClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = APP_PATHS.login
    }
    return Promise.reject(error)
  }
)

export default callsClient
