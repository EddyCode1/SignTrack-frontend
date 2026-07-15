import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Modal from '../../../shared/components/Modal'
import { createGroup, getGroups } from '../../../shared/api/services/groupService'
import { APP_ROUTES, buildDashboardGroupDetailPath } from '../../../shared/config/paths'

const GroupsPage = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const data = await getGroups()
      setGroups(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar los grupos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const name = groupName.trim()
    if (!name) {
      toast.error('Ingresa un nombre para el grupo')
      return
    }

    setCreating(true)
    try {
      const created = await createGroup({ name })
      setGroups((prev) => [created, ...prev])
      setGroupName('')
      setModalOpen(false)
      toast.success('Grupo creado correctamente')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear el grupo')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="p-6">Cargando grupos...</div>

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Mis grupos</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition"
        >
          Crear grupo
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center text-[var(--muted)]">
          No perteneces a ningún grupo. Crea uno para empezar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              to={buildDashboardGroupDetailPath(group.id)}
              className="card block hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <p className="text-sm text-[var(--muted)] mt-2">
                {group.members.length} {group.members.length === 1 ? 'miembro' : 'miembros'}
              </p>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => !creating && setModalOpen(false)}
        title="Crear grupo"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium mb-2">
              Nombre del grupo
            </label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ej. Equipo de traducción"
              className="w-full px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              disabled={creating}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={creating}
              className="px-4 py-2 rounded-lg border border-[var(--accent-soft)] text-[var(--text)] hover:bg-[var(--bg)] transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition disabled:opacity-50"
            >
              {creating ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default GroupsPage
