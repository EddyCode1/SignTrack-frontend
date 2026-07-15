import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getProfile, updateMyProfile } from '../../../shared/api/services/userService'

const ProfilePage = () => {
  const { user, token, setUser } = useAuthStore()
  const [form, setForm] = useState({ name: '', surname: '', phone: '' })
  const [email, setEmail] = useState('')
  const [rol, setRol] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getProfile()
      if (result.success) {
        setForm({
          name: result.data.name || '',
          surname: result.data.surname || '',
          phone: result.data.telefono || '',
        })
        setEmail(result.data.email || '')
        setRol(result.data.rol || '')
      }
      setLoading(false)
    }
    if (token) fetchProfile()
  }, [token])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateMyProfile({
        name: form.name,
        surname: form.surname,
        phone: form.phone,
      })
      setUser({
        ...user,
        name: updated.name,
        surname: updated.surname,
        nombre: `${updated.name} ${updated.surname}`.trim() || updated.username,
        username: updated.username,
        email: updated.email,
        rol: updated.rol,
      })
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Cargando perfil...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Mi Perfil</h1>
      <form onSubmit={handleSubmit} className="card max-w-md space-y-4">
        <div>
          <label className="text-sm text-[var(--muted)]">Nombre</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={25}
            required
            className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--muted)]">Apellido</label>
          <input
            name="surname"
            value={form.surname}
            onChange={handleChange}
            maxLength={25}
            required
            className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--muted)]">Email</label>
          <p className="font-semibold mt-1">{email || user?.email || '-'}</p>
        </div>
        <div>
          <label className="text-sm text-[var(--muted)]">Teléfono</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            pattern="\d{8}"
            maxLength={8}
            placeholder="8 dígitos"
            required
            className="w-full mt-1 px-3 py-2 rounded-lg border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--muted)]">Rol</label>
          <p className="font-semibold mt-1">{rol || user?.rol || '-'}</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 px-4 rounded-lg bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

export default ProfilePage
