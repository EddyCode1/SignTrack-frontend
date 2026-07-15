import axios from 'axios'
import useAuthStore from '../stores/useAuthStore'


const adminClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
adminClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Si es FormData, no establecer Content-Type (axios lo hace automáticamente)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => Promise.reject(error)
)


adminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default adminClient