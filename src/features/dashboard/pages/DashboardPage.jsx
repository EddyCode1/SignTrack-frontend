import { Link } from 'react-router-dom'
import {
  FiBell,
  FiCalendar,
  FiCheckSquare,
  FiMessageSquare,
  FiPhone,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { isAdminRole } from '../../../shared/utils/roles'
import { APP_ROUTES } from '../../../shared/config/paths'
import PageHeader from '../../../shared/components/PageHeader'
import AnimatedCard from '../../../shared/components/AnimatedCard'

const cards = [
  {
    title: 'Mi perfil',
    description: 'Información personal y preferencias',
    to: APP_ROUTES.dashboardProfile,
    icon: FiUser,
    accent: 'violet',
  },
  {
    title: 'Grupos',
    description: 'Equipos y colaboración',
    to: APP_ROUTES.dashboardGroups,
    icon: FiUsers,
    accent: 'brand',
  },
  {
    title: 'Solicitudes',
    description: 'Invitaciones pendientes',
    to: APP_ROUTES.dashboardRequests,
    icon: FiBell,
    accent: 'amber',
  },
  {
    title: 'Chats',
    description: 'Mensajes y conversaciones',
    to: APP_ROUTES.dashboardChats,
    icon: FiMessageSquare,
    accent: 'blue',
  },
  {
    title: 'Llamadas',
    description: 'Reuniones y videollamadas',
    to: APP_ROUTES.dashboardCalls,
    icon: FiPhone,
    accent: 'teal',
  },
  {
    title: 'Tareas',
    description: 'Pendientes y seguimiento',
    to: APP_ROUTES.dashboardTasks,
    icon: FiCheckSquare,
    accent: 'rose',
  },
  {
    title: 'Calendario',
    description: 'Eventos y citas',
    to: APP_ROUTES.dashboardCalendar,
    icon: FiCalendar,
    accent: 'indigo',
  },
]

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const isAdmin = isAdminRole(user?.rol)
  const firstName = (user?.nombre || 'Usuario').split(' ')[0]

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Hola, ${firstName}`}
        subtitle="Tu espacio de trabajo inclusivo — accede rápido a tus herramientas"
      />

      <section className="dashboard-section">
        <h2 className="dashboard-section__label">Accesos rápidos</h2>
        <div className="dashboard-grid">
          {cards.map((card, index) => (
            <AnimatedCard key={card.to} {...card} index={index} />
          ))}

          {isAdmin && (
            <AnimatedCard
              to={APP_ROUTES.dashboardUsers}
              title="Usuarios"
              description="Administración del sistema"
              icon={FiUsers}
              accent="slate"
              index={cards.length}
            />
          )}
        </div>
      </section>

      <section className="dashboard-banner animate-stagger-in" style={{ animationDelay: '420ms' }}>
        <div className="dashboard-banner__content">
          <p className="dashboard-banner__eyebrow">SignTrack Teams</p>
          <h3 className="dashboard-banner__title">Comunicación inclusiva para todos</h3>
          <p className="dashboard-banner__text">
            Próximamente: chat en vivo, videollamadas y traducción de lenguaje de señas en reunión.
          </p>
          <Link to={APP_ROUTES.dashboardGroups} className="btn-brand">
            Ver mis grupos
          </Link>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
