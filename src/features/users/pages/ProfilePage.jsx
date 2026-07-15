import { useState, useEffect } from 'react'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { getProfile } from '../../../shared/api/services/userService'

const ProfilePage = () => {
  const { user, token } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getProfile()
      if (result.success) {
        setProfile(result.data)
      }
      setLoading(false)
    }
    if (token) fetchProfile()
  }, [token])

  if (loading) return <div className="p-6">Cargando perfil...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Mi Perfil</h1>
      <div className="card max-w-md">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--muted)]">Nombre</label>
            <p className="font-semibold">{profile?.nombre || user?.nombre || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-[var(--muted)]">Email</label>
            <p className="font-semibold">{profile?.email || user?.email || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-[var(--muted)]">Teléfono</label>
            <p className="font-semibold">{profile?.telefono || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-[var(--muted)]">Rol</label>
            <p className="font-semibold">{profile?.rol || user?.rol || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
