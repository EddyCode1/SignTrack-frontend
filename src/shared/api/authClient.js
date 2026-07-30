import axios from 'axios'
import useAuthStore from '../stores/useAuthStore'

// Instancia cliente para autenticación
const authClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    '/api/v1/auth',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests (agregar token)
authClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para responses (manejar 401)
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const refreshUrl =
            import.meta.env.VITE_API_URL ||
            '/api/v1/auth'
          const response = await axios.post(
            `${refreshUrl}/refresh`,
            { refreshToken }
          )

          useAuthStore.getState().setTokens(
            response.data.token,
            response.data.refreshToken
          )

          originalRequest.headers.Authorization = `Bearer ${response.data.token}`
          return authClient(originalRequest)
        }
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default authClient
