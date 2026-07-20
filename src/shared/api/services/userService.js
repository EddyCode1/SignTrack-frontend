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
    const response = await adminClient.get('/users')
    return Array.isArray(response.data) ? response.data.map(normalizeUser) : []
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return []
  }
}

export const getContacts = async (query = '') => {
  if (isAuthDisabled()) {
    return [
      normalizeUser({
        id: 'other-user',
        name: 'Colaborador',
        surname: 'Demo',
        username: 'colaborador',
        email: 'colab@demo.com',
        role: 'USER_ROLE',
      }),
    ]
  }
  const response = await adminClient.get('/users/contacts', {
    params: query ? { q: query } : {},
  })
  return Array.isArray(response.data) ? response.data.map(normalizeUser) : []
}

export const getDirectory = async (query = '') => {
  if (isAuthDisabled()) {
    return [
      normalizeUser({
        id: 'other-user',
        name: 'Colaborador',
        surname: 'Demo',
        username: 'colaborador',
        email: 'colab@demo.com',
        role: 'USER_ROLE',
      }),
    ]
  }
  const response = await adminClient.get('/users/directory', {
    params: query ? { q: query } : {},
  })
  return Array.isArray(response.data) ? response.data.map(normalizeUser) : []
}

export const getProfile = async () => {
  if (isAuthDisabled()) {
    return {
      success: true,
      data: {
        name: 'Usuario',
        surname: 'Dev',
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
        name: data.name || '',
        surname: data.surname || '',
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
  if (isAuthDisabled()) {
    return normalizeUser({
      id: DEV_MOCK_USER.id,
      name: payload.name || 'Usuario',
      surname: payload.surname || 'Dev',
      username: DEV_MOCK_USER.username,
      email: DEV_MOCK_USER.email,
      phone: payload.phone || '00000000',
      role: DEV_MOCK_USER.rol,
    })
  }
  const response = await adminClient.put('/users/me', payload)
  return normalizeUser(response.data)
}

export const updateUserRole = async (userId, roleName) => {
  if (isAuthDisabled()) {
    return normalizeUser({
      id: userId,
      name: 'Usuario',
      surname: 'Dev',
      username: DEV_MOCK_USER.username,
      email: DEV_MOCK_USER.email,
      role: roleName,
    })
  }
  const response = await adminClient.put(`/users/${userId}/role`, { roleName })
  return normalizeUser(response.data)
}

export default {
  getUsers,
  getContacts,
  getDirectory,
  getProfile,
  updateMyProfile,
  updateUserRole,
}
