import adminClient from '../adminClient'
import { isAuthDisabled, DEV_MOCK_USER } from '../../config/devAuth'

const normalizeRequest = (request) => ({
  id: request.id || request._id,
  type: request.type || 'group_invite',
  status: request.status || 'pending',
  groupId: request.groupId || request.group?.id || null,
  groupName: request.groupName || request.group?.name || '',
  fromUserId: request.fromUserId || request.senderId || request.from?.id || '',
  fromUsername: request.fromUsername || request.from?.username || request.senderName || '',
  toUserId: request.toUserId || request.recipientId || request.to?.id || '',
  createdAt: request.createdAt || null,
})

let devRequests = [
  normalizeRequest({
    id: 'dev-request-1',
    type: 'group_invite',
    status: 'pending',
    groupId: 'dev-group-1',
    groupName: 'Grupo Dev',
    fromUserId: 'other-user',
    fromUsername: 'colaborador',
    toUserId: DEV_MOCK_USER.id,
  }),
]

export const getInbox = async () => {
  if (isAuthDisabled()) {
    return devRequests.filter((r) => r.toUserId === DEV_MOCK_USER.id || r.status === 'pending')
  }
  const response = await adminClient.get('/requests/inbox')
  const data = Array.isArray(response.data) ? response.data : response.data?.items || []
  return data.map(normalizeRequest)
}

export const createRequest = async (payload) => {
  if (isAuthDisabled()) {
    const request = normalizeRequest({
      id: `dev-request-${Date.now()}`,
      ...payload,
      fromUserId: DEV_MOCK_USER.id,
      fromUsername: DEV_MOCK_USER.username,
      status: 'pending',
    })
    devRequests = [request, ...devRequests]
    return request
  }
  const response = await adminClient.post('/requests', payload)
  return normalizeRequest(response.data)
}

export const updateRequestStatus = async (requestId, status) => {
  if (isAuthDisabled()) {
    const request = devRequests.find((r) => r.id === requestId)
    if (!request) throw Object.assign(new Error('Solicitud no encontrada'), { response: { status: 404 } })
    request.status = status
    return request
  }
  const response = await adminClient.patch(`/requests/${requestId}`, { status })
  return normalizeRequest(response.data)
}

export default {
  getInbox,
  createRequest,
  updateRequestStatus,
}
