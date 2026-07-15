import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getUsers, updateUserRole } from '../../../shared/api/services/userService'
import { APP_ROUTES } from '../../../shared/config/paths'

const ROLE_OPTIONS = [
  { value: 'USER_ROLE', label: 'Usuario' },
  { value: 'ADMIN_ROLE', label: 'Administrador' },
]

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingRoleId, setUpdatingRoleId] = useState(null)

  const fetchUsers = async () => {
    const data = await getUsers()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter((user) => {
      const fullName = `${user.name} ${user.surname}`.toLowerCase()
      return (
        fullName.includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term)
      )
    })
  }, [users, search])

  const handleRoleChange = async (userId, roleName) => {
    setUpdatingRoleId(userId)
    try {
      const updated = await updateUserRole(userId, roleName)
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, rol: updated.rol } : u))
      )
      toast.success('Rol actualizado correctamente')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar el rol')
    } finally {
      setUpdatingRoleId(null)
    }
  }

  if (loading) return <div className="p-6">Cargando usuarios...</div>

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Usuarios</h1>
        <Link
          to={APP_ROUTES.dashboardGroups}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition"
        >
          Invitar a grupo
        </Link>
      </div>
      <div className="mb-4">
        <input
          type="search"
          placeholder="Buscar por nombre, email o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--accent-soft)]">
              <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Rol</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[var(--muted)]">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-[var(--accent-soft)] hover:bg-[var(--surface)]">
                  <td className="px-4 py-3">{user.name} {user.surname}</td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.rol}
                      disabled={updatingRoleId === user._id}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="px-2 py-1 rounded border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersPage
