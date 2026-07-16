import adminClient from '../adminClient'
import { isAuthDisabled, DEV_MOCK_USER } from '../../config/devAuth'

const normalizeMember = (member) => ({
  userId: member.userId || member.id || member._id,
  username: member.username || '',
  name: member.name || '',
  surname: member.surname || '',
  email: member.email || '',
})

const normalizeGroup = (group) => ({
  id: group.id || group._id,
  name: group.name || '',
  ownerId: group.ownerId || group.createdByUserId || group.owner?.id || group.owner?._id || '',
  members: Array.isArray(group.members) ? group.members.map(normalizeMember) : [],
  createdAt: group.createdAt || null,
})

let devGroups = [
  normalizeGroup({
    id: 'dev-group-1',
    name: 'Grupo Dev',
    ownerId: DEV_MOCK_USER.id,
    members: [
      {
        userId: DEV_MOCK_USER.id,
        username: DEV_MOCK_USER.username,
        name: 'Usuario',
        surname: 'Dev',
        email: DEV_MOCK_USER.email,
      },
    ],
  }),
]

export const getGroups = async () => {
  if (isAuthDisabled()) {
    return [...devGroups]
  }
  const response = await adminClient.get('/groups')
  const data = Array.isArray(response.data) ? response.data : response.data?.items || []
  return data.map(normalizeGroup)
}

export const getGroup = async (groupId) => {
  if (isAuthDisabled()) {
    const group = devGroups.find((g) => g.id === groupId)
    if (!group) throw Object.assign(new Error('Grupo no encontrado'), { response: { status: 404 } })
    return group
  }
  const response = await adminClient.get(`/groups/${groupId}`)
  return normalizeGroup(response.data)
}

export const createGroup = async ({ name }) => {
  if (isAuthDisabled()) {
    const group = normalizeGroup({
      id: `dev-group-${Date.now()}`,
      name,
      ownerId: DEV_MOCK_USER.id,
      members: [
        {
          userId: DEV_MOCK_USER.id,
          username: DEV_MOCK_USER.username,
          name: 'Usuario',
          surname: 'Dev',
          email: DEV_MOCK_USER.email,
        },
      ],
    })
    devGroups = [group, ...devGroups]
    return group
  }
  const response = await adminClient.post('/groups', { name })
  return normalizeGroup(response.data)
}

export const addGroupMember = async (groupId, userId) => {
  if (isAuthDisabled()) {
    const group = devGroups.find((g) => g.id === groupId)
    if (!group) throw Object.assign(new Error('Grupo no encontrado'), { response: { status: 404 } })
    if (!group.members.some((m) => m.userId === userId)) {
      group.members.push(
        normalizeMember({
          userId,
          username: `user-${userId}`,
          name: 'Usuario',
          surname: 'Invitado',
        })
      )
    }
    return group
  }
  const response = await adminClient.post(`/groups/${groupId}/members`, { userId })
  return normalizeGroup(response.data)
}

export const removeGroupMember = async (groupId, userId) => {
  if (isAuthDisabled()) {
    const group = devGroups.find((g) => g.id === groupId)
    if (!group) throw Object.assign(new Error('Grupo no encontrado'), { response: { status: 404 } })
    group.members = group.members.filter((m) => m.userId !== userId)
    return group
  }
  const response = await adminClient.delete(`/groups/${groupId}/members/${userId}`)
  return normalizeGroup(response.data)
}

export default {
  getGroups,
  getGroup,
  createGroup,
  addGroupMember,
  removeGroupMember,
}
