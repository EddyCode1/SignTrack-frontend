import { Link } from 'react-router-dom'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { isAdminRole } from '../../../shared/utils/roles'
import { APP_ROUTES } from '../../../shared/config/paths'

const cards = [
  { title: 'Mi Perfil', description: 'Gestiona tu información personal', to: APP_ROUTES.dashboardProfile },
  { title: 'Grupos', description: 'Crea y administra tus grupos', to: APP_ROUTES.dashboardGroups },
  { title: 'Solicitudes', description: 'Invitaciones y peticiones pendientes', to: APP_ROUTES.dashboardRequests },
  { title: 'Chats', description: 'Mensajes y conversaciones', to: APP_ROUTES.dashboardChats },
  { title: 'Llamadas', description: 'Historial y llamadas en curso', to: APP_ROUTES.dashboardCalls },
  { title: 'Tareas', description: 'Pendientes y seguimiento', to: APP_ROUTES.dashboardTasks },
  { title: 'Calendario', description: 'Eventos y recordatorios', to: APP_ROUTES.dashboardCalendar },
]

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = isAdminRole(user?.rol)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
        Bienvenido, {user?.nombre || 'Usuario'}
      </h1>
      <p className="text-[var(--muted)]">Panel principal de SignTrack</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="card block hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg">{card.title}</h3>
            <p className="text-sm text-[var(--muted)] mt-2">{card.description}</p>
          </Link>
        ))}

        {isAdmin && (
          <Link
            to={APP_ROUTES.dashboardUsers}
            className="card block hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg">Usuarios</h3>
            <p className="text-sm text-[var(--muted)] mt-2">Administra los usuarios del sistema</p>
          </Link>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
