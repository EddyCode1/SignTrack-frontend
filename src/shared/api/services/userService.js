import adminClient from '../adminClient'

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
  try {
    const response = await adminClient.get('/users/by-role/USER_ROLE')
    return Array.isArray(response.data) ? response.data.map(normalizeUser) : []
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}

export const getProfile = async () => {
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
