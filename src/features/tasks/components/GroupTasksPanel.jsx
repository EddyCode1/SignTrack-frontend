import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createTask, deleteTask, getTasks, updateTask } from '../../../shared/api/services/taskService'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'done', label: 'Completada' },
]

const GroupTasksPanel = ({ groupId, members = [] }) => {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [loading, setLoading] = useState(true)

  const memberLabel = (userId) => {
    const member = members.find((m) => m.userId === userId)
    if (!member) return userId
    return `${member.name} ${member.surname}`.trim() || member.username
  }

  const load = async () => {
    setLoading(true)
    try {
      setTasks(await getTasks({ groupId }))
    } catch {
      toast.error('Error al cargar tareas del grupo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [groupId])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      await createTask({
        title: title.trim(),
        groupId,
        assigneeId: assigneeId || undefined,
      })
      setTitle('')
      setAssigneeId('')
      toast.success('Tarea creada')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear tarea')
    }
  }

  const handleStatus = async (taskId, status) => {
    try {
      await updateTask(taskId, { status })
      load()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleAssignee = async (taskId, nextAssigneeId) => {
    try {
      await updateTask(taskId, { assigneeId: nextAssigneeId || null })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al asignar')
    }
  }

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId)
      toast.success('Tarea eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <p className="p-4 text-[var(--muted)]">Cargando tareas...</p>

  return (
    <div>
      <form onSubmit={handleCreate} className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm mb-1">Nueva tarea</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título..."
            className="w-full px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-sm mb-1">Asignar a</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
          >
            <option value="">Sin asignar</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {memberLabel(m.userId)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-brand px-4 py-2">Agregar</button>
      </form>

      <div className="divide-y divide-[var(--accent-soft)]">
        {tasks.length === 0 ? (
          <p className="py-4 text-[var(--muted)]">No hay tareas en este grupo.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[160px]">
                <div className="font-medium">{task.title}</div>
                {task.assigneeId && (
                  <div className="text-xs text-[var(--muted)]">
                    Asignada a: {memberLabel(task.assigneeId)}
                  </div>
                )}
              </div>
              <select
                value={task.assigneeId || ''}
                onChange={(e) => handleAssignee(task.id, e.target.value)}
                className="px-2 py-1 rounded border border-[var(--accent-soft)] bg-[var(--surface)] text-sm"
              >
                <option value="">Sin asignar</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {memberLabel(m.userId)}
                  </option>
                ))}
              </select>
              <select
                value={task.status}
                onChange={(e) => handleStatus(task.id, e.target.value)}
                className="px-2 py-1 rounded border border-[var(--accent-soft)] bg-[var(--surface)] text-sm"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button type="button" onClick={() => handleDelete(task.id)} className="text-red-500 text-sm">
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GroupTasksPanel
