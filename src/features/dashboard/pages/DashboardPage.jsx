import { useEffect, useState } from 'react'
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
import { getInbox } from '../../../shared/api/services/requestService'
import { getTasks } from '../../../shared/api/services/taskService'
import { getAppointments } from '../../../shared/api/services/appointmentService'
import { getGroups } from '../../../shared/api/services/groupService'
import { getConversations } from '../../../shared/api/services/chatService'
import { getRooms } from '../../../shared/api/services/callsService'

const cards = [
  {
    title: 'Mi perfil',
    description: 'Información personal y preferencias',
    to: APP_ROUTES.dashboardProfile,
    icon: FiUser,
    accent: 'violet',
  },
  {
    title: 'Contactos',
    description: 'Usuarios y mensajes directos',
    to: APP_ROUTES.dashboardContacts,
    icon: FiUsers,
    accent: 'slate',
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
  const [stats, setStats] = useState({
    pendingRequests: 0,
    openTasks: 0,
    upcomingAppointments: 0,
    groups: 0,
    chats: 0,
    activeRooms: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [inbox, tasks, appointments, groups, chats, rooms] = await Promise.all([
          getInbox(),
          getTasks(),
          getAppointments(),
          getGroups(),
          getConversations(),
          getRooms(),
        ])
        const now = new Date()
        setStats({
          pendingRequests: inbox.filter((r) => r.status === 'pending').length,
          openTasks: tasks.filter((t) => t.status !== 'done').length,
          upcomingAppointments: appointments.filter((a) => new Date(a.startUtc) >= now).length,
          groups: groups.length,
          chats: chats.length,
          activeRooms: rooms.filter((r) => r.status !== 'ended').length,
        })
      } catch {
        /* widgets opcionales */
      }
    }
    loadStats()
  }, [])

  const statWidgets = [
    { label: 'Solicitudes pendientes', value: stats.pendingRequests, to: APP_ROUTES.dashboardRequests },
    { label: 'Tareas abiertas', value: stats.openTasks, to: APP_ROUTES.dashboardTasks },
    { label: 'Próximas citas', value: stats.upcomingAppointments, to: APP_ROUTES.dashboardCalendar },
    { label: 'Mis grupos', value: stats.groups, to: APP_ROUTES.dashboardGroups },
    { label: 'Conversaciones', value: stats.chats, to: APP_ROUTES.dashboardChats },
    { label: 'Reuniones activas', value: stats.activeRooms, to: APP_ROUTES.dashboardCalls },
  ]

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Hola, ${firstName}`}
        subtitle="Tu espacio de trabajo inclusivo — accede rápido a tus herramientas"
      />

      <section className="dashboard-section">
        <h2 className="dashboard-section__label">Resumen</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {statWidgets.map((widget) => (
            <Link
              key={widget.label}
              to={widget.to}
              className="card p-4 hover:border-[var(--accent)] transition-colors"
            >
              <div className="text-2xl font-bold text-[var(--primary)]">{widget.value}</div>
              <div className="text-xs text-[var(--muted)] mt-1">{widget.label}</div>
            </Link>
          ))}
        </div>
      </section>

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
            Chat, videollamadas, tareas, calendario y contactos en un solo lugar.
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
