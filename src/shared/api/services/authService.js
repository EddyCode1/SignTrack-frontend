import authClient from '../authClient'
import adminClient from '../adminClient'
import toast from 'react-hot-toast'

const mapUserFromDetails = (ud = {}) => ({
  id: ud.id || null,
  _id: ud.id || null,
  nombre: ud.username || ud.name || '',
  username: ud.username || '',
  email: ud.email || '',
  profilePicture: ud.profilePicture || null,
  rol: ud.role || 'USER_ROLE',
})

const mapUserFromResponse = (u = {}) => ({
  id: u.id,
  _id: u.id,
  name: u.name || '',
  surname: u.surname || '',
  nombre: u.name || u.username || '',
  username: u.username || '',
  email: u.email || '',
  profilePicture: u.profilePicture || null,
  rol: u.role || 'USER_ROLE',
})

export const authService = {
  login: async (emailOrUsername, password) => {
    try {
      const response = await authClient.post('/login', { emailOrUsername, password })
      const data = response.data

      const token = data.token || data.Token
      if (!token) {
        throw new Error(data.message || 'El backend no devolvió un token')
      }

      let user = mapUserFromDetails(data.userDetails || data.UserDetails)

      if (!user.email) {
        try {
          const profileRes = await authClient.get('/profile', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const profile = profileRes.data?.data || profileRes.data
          user = { ...user, ...mapUserFromResponse(profile) }
        } catch {
          /* perfil opcional tras login */
        }
      }

      return { success: true, token, refreshToken: null, user }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        'Error al iniciar sesión'
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  register: async (userData) => {
    try {
      const formData = new FormData()
      formData.append('Name', userData.name || '')
      formData.append('Surname', userData.surname || '')
      formData.append('Username', userData.username || '')
      formData.append('Email', userData.email || '')
      formData.append('Password', userData.password || '')
      formData.append('Phone', userData.phone || '')
      if (userData.profilePicture) {
        formData.append('ProfilePicture', userData.profilePicture)
      }

      const response = await authClient.post('/register', formData)
      return { success: true, user: response.data }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al registrar usuario'
      toast.error(msg)
      return { success: false, error: msg }
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await authClient.get('/profile')
      const data = response.data?.data || response.data
      return { success: true, user: mapUserFromResponse(data) }
    } catch {
      return { success: false, error: 'Token inválido' }
    }
  },

  logout: () => ({ success: true }),
}
