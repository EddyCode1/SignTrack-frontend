import authClient from '../authClient'
import toast from 'react-hot-toast'

export const authService = {
  login: async (emailOrUsername, password) => {
    try {
      const response = await authClient.post('/login', { emailOrUsername, password })
      const data = response.data

      if (!data.token) {
        throw new Error('El backend no devolvió un token de autenticación')
      }

      const ud = data.userDetails || {}
      const user = {
        id: ud.id || null,
        _id: ud.id || null,
        nombre: ud.username || '',
        username: ud.username || '',
        email: ud.email || '',
        profilePicture: ud.profilePicture || null,
        rol: ud.role || 'USER_ROLE',
      }

      return {
        success: true,
        token: data.token,
        refreshToken: null,
        user,
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Error al iniciar sesión'
      )
      return { success: false, error: error.response?.data?.message || error.message }
    }
  },

  register: async (userData) => {
    try {
      const formData = new FormData()
      formData.append('name', userData.name || '')
      formData.append('surname', userData.surname || '')
      formData.append('username', userData.username || '')
      formData.append('email', userData.email || '')
      formData.append('password', userData.password || '')
      formData.append('phone', userData.phone || '')
      if (userData.profilePicture) {
        formData.append('profilePicture', userData.profilePicture)
      }

      const response = await authClient.post('/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { success: true, user: response.data }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar usuario')
      return { success: false, error: error.response?.data?.message || error.message }
    }
  },

  getCurrentUser: async (token) => {
    try {
      const response = await authClient.get('/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = response.data?.data || response.data
      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: 'Token inválido' }
    }
  },

  logout: () => {
    return { success: true }
  },
}
