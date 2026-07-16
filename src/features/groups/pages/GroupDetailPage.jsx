import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { isAdminRole } from '../../../shared/utils/roles'
import { getUsers } from '../../../shared/api/services/userService'
import { getGroup, removeGroupMember } from '../../../shared/api/services/groupService'
import { createRequest } from '../../../shared/api/services/requestService'
import { createConversation } from '../../../shared/api/services/chatService'
import GroupTasksPanel from '../../tasks/components/GroupTasksPanel'

import { APP_ROUTES } from '../../../shared/config/paths'

const GroupDetailPage = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = isAdminRole(currentUser?.rol)

  const [group, setGroup] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [manualUserId, setManualUserId] = useState('')
  const [inviting, setInviting] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [openingChat, setOpeningChat] = useState(false)
  const [activeTab, setActiveTab] = useState('members')

  const currentUserId = currentUser?.id || currentUser?._id
  const isOwner = useMemo(
    () => group && currentUserId && group.ownerId === currentUserId,
    [group, currentUserId]
  )

  const loadGroup = async () => {
    setLoading(true)
    try {
      const data = await getGroup(groupId)
      setGroup(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar el grupo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroup()
  }, [groupId])

  useEffect(() => {
    if (!isAdmin) return
    getUsers().then(setUsers).catch(() => setUsers([]))
  }, [isAdmin])

  const handleInvite = async (e) => {
    e.preventDefault()
    const targetUserId = (isAdmin ? selectedUserId : manualUserId).trim()
    if (!targetUserId) {
      toast.error('Selecciona o ingresa un usuario')
      return
    }

    setInviting(true)
    try {
      await createRequest({
        type: 'group_invite',
        groupId,
        toUserId: targetUserId,
      })
      toast.success('Invitación enviada')
      setSelectedUserId('')
      setManualUserId('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar la invitación')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (userId) => {
    setRemovingId(userId)
    try {
      const updated = await removeGroupMember(groupId, userId)
      setGroup(updated)
      toast.success('Miembro eliminado')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar el miembro')
    } finally {
      setRemovingId(null)
    }
  }

  const handleOpenGroupChat = async () => {
    setOpeningChat(true)
    try {
      const chat = await createConversation({ groupId, title: group?.name })
      navigate(`/dashboard/chats/${chat.id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo abrir el chat del grupo')
    } finally {
      setOpeningChat(false)
    }
  }

  if (loading) return <div className="p-6">Cargando grupo...</div>

  if (!group) {
    return (
      <div className="p-6">
        <p className="text-[var(--muted)]">Grupo no encontrado.</p>
        <Link to={APP_ROUTES.dashboardGroups} className="text-[var(--accent)] hover:underline mt-4 inline-block">
          Volver a grupos
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link
        to={APP_ROUTES.dashboardGroups}
        className="text-sm text-[var(--muted)] hover:text-[var(--text)] mb-4 inline-block"
      >
        ← Volver a grupos
      </Link>

      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{group.name}</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'}
        {isOwner && ' · Eres el propietario'}
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={handleOpenGroupChat}
          disabled={openingChat}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition disabled:opacity-50"
        >
          {openingChat ? 'Abriendo...' : 'Abrir chat del grupo'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[var(--accent-soft)]">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'members' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted)]'
          }`}
        >
          Miembros
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'tasks' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--muted)]'
          }`}
        >
          Tareas
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="card p-4 mb-6">
          <h2 className="font-semibold text-lg mb-4">Tareas del grupo</h2>
          <GroupTasksPanel groupId={groupId} members={group.members} />
        </div>
      ) : (
        <>
      <div className="card mb-6">
        <h2 className="font-semibold text-lg mb-4">Invitar usuario</h2>
        <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
          {isAdmin ? (
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="userSelect" className="block text-sm font-medium mb-2">
                Usuario
              </label>
              <select
                id="userSelect"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                disabled={inviting}
              >
                <option value="">Seleccionar usuario...</option>
                {users
                  .filter((u) => !group.members.some((m) => m.userId === u._id))
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} {user.surname} (@{user.username})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="userIdInput" className="block text-sm font-medium mb-2">
                ID de usuario
              </label>
              <input
                id="userIdInput"
                type="text"
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                placeholder="ID o nombre de usuario"
                className="w-full px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                disabled={inviting}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={inviting}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {inviting ? 'Enviando...' : 'Invitar a grupo'}
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-lg mb-4">Miembros</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--accent-soft)]">
              <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              {isOwner && <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {group.members.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 4 : 3} className="px-4 py-6 text-center text-[var(--muted)]">
                  No hay miembros en este grupo
                </td>
              </tr>
            ) : (
              group.members.map((member) => (
                <tr
                  key={member.userId}
                  className="border-b border-[var(--accent-soft)] hover:bg-[var(--surface)]"
                >
                  <td className="px-4 py-3">
                    {member.name} {member.surname}
                    {member.userId === group.ownerId && (
                      <span className="ml-2 text-xs text-[var(--muted)]">(propietario)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{member.username || '—'}</td>
                  <td className="px-4 py-3">{member.email || '—'}</td>
                  {isOwner && (
                    <td className="px-4 py-3">
                      {member.userId !== group.ownerId && (
                        <button
                          type="button"
                          onClick={() => handleRemove(member.userId)}
                          disabled={removingId === member.userId}
                          className="px-3 py-1 rounded-lg text-sm text-white bg-[var(--danger)] hover:opacity-90 transition disabled:opacity-50"
                        >
                          {removingId === member.userId ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  )
}

export default GroupDetailPage
