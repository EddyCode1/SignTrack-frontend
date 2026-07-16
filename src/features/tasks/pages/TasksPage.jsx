import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createTask, deleteTask, getTasks, updateTask } from '../../../shared/api/services/taskService'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'done', label: 'Completada' },
]

const TasksPage = () => {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setTasks(await getTasks())
    } catch (err) {
      toast.error('Error al cargar tareas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    try {
      await createTask({ title: title.trim() })
      setTitle('')
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

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId)
      toast.success('Tarea eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <div className="p-6">Cargando tareas...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tareas</h1>

      <form onSubmit={handleCreate} className="card p-4 mb-6 flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea..."
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)]"
        />
        <button type="submit" className="btn-brand px-4">Agregar</button>
      </form>

      <div className="card divide-y divide-[var(--accent-soft)]">
        {tasks.length === 0 ? (
          <p className="p-6 text-[var(--muted)]">No hay tareas.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium">{task.title}</div>
                {task.description && <div className="text-sm text-[var(--muted)]">{task.description}</div>}
              </div>
              <select
                value={task.status}
                onChange={(e) => handleStatus(task.id, e.target.value)}
                className="px-2 py-1 rounded border border-[var(--accent-soft)] bg-[var(--surface)]"
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

export default TasksPage
