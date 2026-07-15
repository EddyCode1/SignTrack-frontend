import { useState, useEffect } from 'react'
import { getUsers } from '../../../shared/api/services/userService'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers()
      setUsers(data)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  if (loading) return <div className="p-6">Cargando usuarios...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Usuarios</h1>
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
            {users.map((user) => (
              <tr key={user._id} className="border-b border-[var(--accent-soft)] hover:bg-[var(--surface)]">
                <td className="px-4 py-3">{user.name} {user.surname}</td>
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersPage
