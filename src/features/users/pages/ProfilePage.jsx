import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getProfile, updateMyProfile } from '../../../shared/api/services/userService'

import PageHeader from '../../../shared/components/PageHeader'

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

  if (loading) return <div className="text-[var(--muted)]">Cargando perfil...</div>

  return (
    <div>
      <PageHeader title="Mi perfil" subtitle="Actualiza tu información personal" />
      <form onSubmit={handleSubmit} className="card max-w-lg space-y-4">
        <label className="field block">
          <span className="field__label">Nombre</span>
          <input name="name" value={form.name} onChange={handleChange} maxLength={25} required className="field__input" />
        </label>
        <label className="field block">
          <span className="field__label">Apellido</span>
          <input name="surname" value={form.surname} onChange={handleChange} maxLength={25} required className="field__input" />
        </label>
        <div>
          <span className="field__label">Email</span>
          <p className="font-medium mt-1">{email || user?.email || '-'}</p>
        </div>
        <label className="field block">
          <span className="field__label">Teléfono</span>
          <input name="phone" value={form.phone} onChange={handleChange} pattern="\d{8}" maxLength={8} required className="field__input" />
        </label>
        <div>
          <span className="field__label">Rol</span>
          <p className="font-medium mt-1">{rol || user?.rol || '-'}</p>
        </div>
        <button type="submit" disabled={saving} className="btn-brand btn-brand--full">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

export default ProfilePage
