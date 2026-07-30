import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiBell,
  FiCalendar,
  FiCheckSquare,
  FiCompass,
  FiMessageSquare,
  FiPhone,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { isAdminRole } from '../../../shared/utils/roles'
import { APP_ROUTES } from '../../../shared/config/paths'
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

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const getInitials = (name) =>
  (name || 'Usuario')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

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
  const [statsLoaded, setStatsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
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
        if (cancelled) return
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
      } finally {
        if (!cancelled) setStatsLoaded(true)
      }
    }
    loadStats()
    return () => {
      cancelled = true
    }
  }, [])

  const statWidgets = [
    {
      label: 'Solicitudes pendientes',
      value: stats.pendingRequests,
      to: APP_ROUTES.dashboardRequests,
      icon: FiBell,
      accent: 'amber',
    },
    {
      label: 'Tareas abiertas',
      value: stats.openTasks,
      to: APP_ROUTES.dashboardTasks,
      icon: FiCheckSquare,
      accent: 'rose',
    },
    {
      label: 'Próximas citas',
      value: stats.upcomingAppointments,
      to: APP_ROUTES.dashboardCalendar,
      icon: FiCalendar,
      accent: 'indigo',
    },
    {
      label: 'Mis grupos',
      value: stats.groups,
      to: APP_ROUTES.dashboardGroups,
      icon: FiUsers,
      accent: 'brand',
    },
    {
      label: 'Conversaciones',
      value: stats.chats,
      to: APP_ROUTES.dashboardChats,
      icon: FiMessageSquare,
      accent: 'blue',
    },
    {
      label: 'Reuniones activas',
      value: stats.activeRooms,
      to: APP_ROUTES.dashboardCalls,
      icon: FiPhone,
      accent: 'teal',
    },
  ]

  const totalActivity = statWidgets.reduce((sum, widget) => sum + (widget.value || 0), 0)
  const showEmptyState = statsLoaded && totalActivity === 0

  const today = new Date().toLocaleDateString('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero animate-stagger-in">
        <div className="dashboard-hero__intro">
          <div className="dashboard-hero__avatar" aria-hidden="true">
            {getInitials(user?.nombre || user?.email)}
          </div>
          <div className="min-w-0">
            <p className="dashboard-hero__eyebrow">
              {getGreeting()}
              <span aria-hidden="true">·</span>
              <span className="dashboard-hero__eyebrow-date">{today}</span>
            </p>
            <h1 className="dashboard-hero__title">Hola, {firstName}</h1>
            <p className="dashboard-hero__subtitle">
              Tu espacio de trabajo inclusivo — accede rápido a tus herramientas
            </p>
          </div>
        </div>
      </header>

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2 className="dashboard-section__label">Resumen</h2>
          <p className="dashboard-section__hint">Datos en tiempo real de tu actividad</p>
        </div>

        {showEmptyState && (
          <div className="dashboard-empty animate-stagger-in">
            <div className="dashboard-empty__icon">
              <FiCompass size={22} aria-hidden="true" />
            </div>
            <div>
              <h3 className="dashboard-empty__title">Todo tranquilo por aquí</h3>
              <p className="dashboard-empty__text">
                Aún no tienes actividad reciente. Empieza por añadir contactos, crear un grupo o
                iniciar una conversación.
              </p>
            </div>
            <Link to={APP_ROUTES.dashboardContacts} className="btn-brand dashboard-empty__cta">
              Explorar contactos
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="dashboard-stats">
          {statWidgets.map((widget, index) => {
            const Icon = widget.icon
            return (
              <Link
                key={widget.label}
                to={widget.to}
                className={`dashboard-stat animated-card--accent-${widget.accent} animate-stagger-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="animated-card__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="dashboard-stat__value">{widget.value}</span>
                <span className="dashboard-stat__label">{widget.label}</span>
              </Link>
            )
          })}
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

      <section className="dashboard-cta animate-stagger-in" style={{ animationDelay: '420ms' }}>
        <div className="dashboard-cta__content">
          <p className="dashboard-cta__eyebrow">SignTrack Teams</p>
          <h3 className="dashboard-cta__title">Comunicación inclusiva para todos</h3>
          <p className="dashboard-cta__text">
            Chat, videollamadas, tareas, calendario y contactos en un solo lugar.
          </p>
          <Link to={APP_ROUTES.dashboardGroups} className="btn-brand">
            Ver mis grupos
          </Link>
        </div>
        <div className="dashboard-cta__visual" aria-hidden="true">
          <span className="dashboard-cta__chip">
            <FiMessageSquare size={22} />
          </span>
          <span className="dashboard-cta__chip">
            <FiPhone size={22} />
          </span>
          <span className="dashboard-cta__chip">
            <FiUsers size={22} />
          </span>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
