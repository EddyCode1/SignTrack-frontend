import adminClient from '../adminClient'
import { isAuthDisabled, DEV_MOCK_USER } from '../../config/devAuth'

const normalizeUser = (user) => ({
  ...user,
  _id: user.id || user._id,
  name: user.name || '',
  surname: user.surname || '',
  username: user.username || '',
  email: user.email || '',
  rol: user.role || 'USER_ROLE',
})

export const getUsers = async () => {
  if (isAuthDisabled()) {
    return [
      normalizeUser({
        id: DEV_MOCK_USER.id,
        name: 'Usuario',
        surname: 'Dev',
        username: DEV_MOCK_USER.username,
        email: DEV_MOCK_USER.email,
        role: DEV_MOCK_USER.rol,
      }),
    ]
  }
  try {
    const response = await adminClient.get('/users/by-role/USER_ROLE')
    return Array.isArray(response.data) ? response.data.map(normalizeUser) : []
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}

export const getProfile = async () => {
  if (isAuthDisabled()) {
    return {
      success: true,
      data: {
        nombre: DEV_MOCK_USER.nombre,
        email: DEV_MOCK_USER.email,
        telefono: '00000000',
        rol: DEV_MOCK_USER.rol,
        profilePicture: null,
      },
    }
  }
  try {
    const response = await adminClient.get('/users/me')
    const data = response.data
    return {
      success: true,
      data: {
        nombre: `${data.name || ''} ${data.surname || ''}`.trim() || data.username,
        email: data.email || '',
        telefono: data.phone || '',
        rol: data.role || '',
        profilePicture: data.profilePicture || null,
      },
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message }
  }
}

export const updateMyProfile = async (payload) => {
  const response = await adminClient.put('/users/me', payload)
  return normalizeUser(response.data)
}

export default {
  getUsers,
  getProfile,
  updateMyProfile,
}
