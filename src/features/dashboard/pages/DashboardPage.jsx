import useAuthStore from '../../../shared/stores/useAuthStore'

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
        Bienvenido, {user?.nombre || 'Usuario'}
      </h1>
      <p className="text-[var(--muted)]">Panel principal de SignTrack</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="card">
          <h3 className="font-semibold text-lg">Mi Perfil</h3>
          <p className="text-sm text-[var(--muted)] mt-2">Gestiona tu información personal</p>
        </div>
        {user?.rol === 'ADMIN_ROLE' && (
          <div className="card">
            <h3 className="font-semibold text-lg">Usuarios</h3>
            <p className="text-sm text-[var(--muted)] mt-2">Administra los usuarios del sistema</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
