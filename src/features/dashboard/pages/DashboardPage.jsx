import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiActivity,
  FiArrowRight,
  FiBell,
  FiCalendar,
  FiCheck,
  FiCheckSquare,
  FiCompass,
  FiMessageSquare,
  FiPhone,
  FiUser,
  FiUserPlus,
  FiUsers,
  FiVideo,
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

const featureMinis = [
  {
    title: 'Chat en tiempo real',
    text: 'Conversaciones individuales o en grupo, con historial sincronizado en todos tus dispositivos.',
    to: APP_ROUTES.dashboardChats,
    icon: FiMessageSquare,
    accent: 'blue',
  },
  {
    title: 'Videollamadas 1:1 y grupales',
    text: 'Comunícate cara a cara con calidad estable, pensada para expresarte con claridad.',
    to: APP_ROUTES.dashboardCalls,
    icon: FiPhone,
    accent: 'teal',
  },
  {
    title: 'Contactos y grupos',
    text: 'Organiza tu red de contactos y crea grupos de trabajo o estudio en segundos.',
    to: APP_ROUTES.dashboardContacts,
    icon: FiUsers,
    accent: 'violet',
  },
]

const onboardingSteps = [
  {
    id: 1,
    title: 'Agrega tus contactos',
    text: 'Busca personas y envía solicitudes para empezar a construir tu red dentro de SignTrack.',
    to: APP_ROUTES.dashboardContacts,
    icon: FiUserPlus,
  },
  {
    id: 2,
    title: 'Chatea o inicia una llamada',
    text: 'Escribe un mensaje o abre una videollamada directamente desde tu lista de contactos.',
    to: APP_ROUTES.dashboardChats,
    icon: FiMessageSquare,
  },
  {
    id: 3,
    title: 'Usa el modo de señas en llamada',
    text: 'SignTrack detecta cuándo estás usando lenguaje de señas y lo indica a los demás participantes.',
    to: APP_ROUTES.dashboardCalls,
    icon: FiActivity,
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

  // Sugiere el siguiente paso lógico según la actividad real del usuario:
  // sin red de contactos -> sin conversaciones activas -> listo para el modo de señas.
  const onboardingStep = useMemo(() => {
    if (!statsLoaded) return 1
    const hasNetwork = stats.groups > 0 || stats.chats > 0
    if (!hasNetwork) return 1
    const hasStartedTalking = stats.chats > 0 || stats.activeRooms > 0
    if (!hasStartedTalking) return 2
    return 3
  }, [statsLoaded, stats])

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
              Comunicación inclusiva en un solo lugar: chatea, llama y comunícate en lenguaje de
              señas con reconocimiento por IA integrado en tus videollamadas.
            </p>
          </div>
        </div>
        <div className="dashboard-hero__visual" aria-hidden="true">
          <span className="dashboard-hero__chip dashboard-hero__chip--1">
            <FiMessageSquare size={20} />
          </span>
          <span className="dashboard-hero__chip dashboard-hero__chip--2">
            <FiVideo size={20} />
          </span>
          <span className="dashboard-hero__chip dashboard-hero__chip--3">
            <FiUsers size={20} />
          </span>
        </div>
      </header>

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2 className="dashboard-section__label">Qué puedes hacer aquí</h2>
          <p className="dashboard-section__hint">Las herramientas principales de SignTrack</p>
        </div>

        <div className="dashboard-features">
          <Link
            to={APP_ROUTES.dashboardCalls}
            className="dashboard-feature animate-stagger-in"
          >
            <span className="dashboard-feature__decor" aria-hidden="true" />
            <span className="dashboard-feature__icon-stack" aria-hidden="true">
              <span className="dashboard-feature__icon-main">
                <FiVideo size={26} />
              </span>
              <span className="dashboard-feature__icon-badge">
                <FiActivity size={14} />
              </span>
            </span>
            <span className="dashboard-feature__tag">Lo que nos hace únicos</span>
            <h3 className="dashboard-feature__title">
              Reconocimiento de señas en videollamada
            </h3>
            <p className="dashboard-feature__text">
              Durante una llamada, SignTrack detecta cuándo alguien está usando lenguaje de señas
              y lo señala en pantalla al instante, para que la conversación fluya sin perder
              ningún mensaje.
            </p>
            <span className="dashboard-feature__link">
              Iniciar una videollamada
              <FiArrowRight aria-hidden="true" />
            </span>
          </Link>

          <div className="dashboard-features__minis">
            {featureMinis.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  to={feature.to}
                  className={`dashboard-feature-mini animated-card--accent-${feature.accent} animate-stagger-in`}
                >
                  <span className="dashboard-feature-mini__icon animated-card__icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="dashboard-feature-mini__title">{feature.title}</h4>
                    <p className="dashboard-feature-mini__text">{feature.text}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__head">
          <h2 className="dashboard-section__label">Primeros pasos</h2>
          <p className="dashboard-section__hint">El flujo típico dentro de SignTrack</p>
        </div>

        <div className="dashboard-steps">
          {onboardingSteps.map((step, index) => {
            const Icon = step.icon
            const status =
              step.id < onboardingStep ? 'done' : step.id === onboardingStep ? 'current' : 'upcoming'
            return (
              <Link
                key={step.id}
                to={step.to}
                className={`dashboard-step dashboard-step--${status} animate-stagger-in`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {status === 'current' && (
                  <span className="dashboard-step__badge">Siguiente para ti</span>
                )}
                <span className="dashboard-step__index">
                  {status === 'done' ? <FiCheck aria-hidden="true" /> : step.id}
                </span>
                <span className="dashboard-step__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h4 className="dashboard-step__title">{step.title}</h4>
                <p className="dashboard-step__text">{step.text}</p>
              </Link>
            )
          })}
        </div>
      </section>

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
