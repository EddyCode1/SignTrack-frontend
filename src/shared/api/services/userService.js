import authClient from '../authClient'

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
    const response = await authClient.get('/by-role/USER_ROLE')
    return Array.isArray(response.data) ? response.data.map(normalizeUser) : []
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}

export const createUser = async (userData) => {
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
    const created = response.data?.user || response.data
    return normalizeUser(created)
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw error
  }
}

export const updateUser = async (id, userData) => {
  try {
    const response = await authClient.put(`/users/${id}`, userData)
    return normalizeUser(response.data?.user || response.data)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    throw error
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await authClient.delete(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    throw error
  }
}

export const getProfile = async (token) => {
  try {
    const response = await authClient.get('/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = response.data?.data || response.data
    const profile = {
      nombre: data.name || data.username || '',
      email: data.email || '',
      telefono: data.phone || '',
      rol: data.role || '',
      profilePicture: data.profilePicture || null,
    }
    return { success: true, data: profile }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message }
  }
}

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
}
