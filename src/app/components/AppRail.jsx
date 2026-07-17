import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiCheckSquare,
  FiHome,
  FiLogOut,
  FiMessageSquare,
  FiPhone,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import useAuthStore from '../../shared/stores/useAuthStore'
import { isAdminRole } from '../../shared/utils/roles'
import { APP_ROUTES } from '../../shared/config/paths'
import {
  fetchUnreadTotal,
  subscribeToPush,
  updateAppBadge,
} from '../../shared/api/pushNotificationService'

const railLinkClass = ({ isActive }) =>
  `app-rail__link ${isActive ? 'app-rail__link--active' : ''}`

const mainNav = [
  { to: APP_ROUTES.dashboard, end: true, icon: FiHome, label: 'Inicio' },
  { to: APP_ROUTES.dashboardChats, icon: FiMessageSquare, label: 'Chats' },
  { to: APP_ROUTES.dashboardCalls, icon: FiPhone, label: 'Llamadas' },
  { to: APP_ROUTES.dashboardGroups, icon: FiUsers, label: 'Grupos' },
  { to: APP_ROUTES.dashboardContacts, icon: FiBookOpen, label: 'Contactos' },
  { to: APP_ROUTES.dashboardRequests, icon: FiBell, label: 'Solicitudes' },
  { to: APP_ROUTES.dashboardTasks, icon: FiCheckSquare, label: 'Tareas' },
  { to: APP_ROUTES.dashboardCalendar, icon: FiCalendar, label: 'Calendario' },
]

const AppRail = ({ mobileOpen, onCloseMobile }) => {
  const { logout, user, isAuthenticated: authed } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = isAdminRole(user?.rol)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!authed) return

    const refresh = async () => {
      try {
        const total = await fetchUnreadTotal()
        setUnread(total)
        await updateAppBadge(total)
      } catch {
        /* ignore */
      }
    }

    refresh()
    subscribeToPush().catch(() => {})
    const pollId = setInterval(refresh, 30000)
    const onChatMsg = () => refresh()
    window.addEventListener('signtrack:chat-message', onChatMsg)
    return () => {
      clearInterval(pollId)
      window.removeEventListener('signtrack:chat-message', onChatMsg)
    }
  }, [authed])

  const handleLogout = () => {
    logout()
    navigate(APP_ROUTES.login)
    onCloseMobile?.()
  }

  const railContent = (
    <>
      <div className="app-rail__brand" title="SignTrack">
        <span className="app-rail__logo">ST</span>
      </div>

      <nav className="app-rail__nav" aria-label="Navegación principal">
        {mainNav.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={railLinkClass}
            title={label}
            onClick={onCloseMobile}
          >
            <span className="app-rail__icon-wrap">
              <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
              {to === APP_ROUTES.dashboardChats && unread > 0 && (
                <span className="app-rail__badge">{unread > 99 ? '99+' : unread}</span>
              )}
            </span>
            <span className="app-rail__tooltip">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-rail__footer">
        <NavLink
          to={APP_ROUTES.dashboardProfile}
          className={railLinkClass}
          title="Mi perfil"
          onClick={onCloseMobile}
        >
          <FiUser size={22} strokeWidth={1.75} aria-hidden="true" />
          <span className="app-rail__tooltip">Mi perfil</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to={APP_ROUTES.dashboardUsers}
            className={railLinkClass}
            title="Usuarios"
            onClick={onCloseMobile}
          >
            <FiUsers size={22} strokeWidth={1.75} aria-hidden="true" />
            <span className="app-rail__tooltip">Usuarios</span>
          </NavLink>
        )}

        <button
          type="button"
          className="app-rail__link app-rail__link--logout"
          title="Cerrar sesión"
          onClick={handleLogout}
        >
          <FiLogOut size={22} strokeWidth={1.75} aria-hidden="true" />
          <span className="app-rail__tooltip">Cerrar sesión</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="app-rail hidden md:flex">{railContent}</aside>

      {mobileOpen && (
        <button
          type="button"
          className="app-rail__backdrop md:hidden"
          aria-label="Cerrar menú"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`app-rail app-rail--drawer md:hidden ${mobileOpen ? 'app-rail--open' : ''}`}>
        {railContent}
      </aside>
    </>
  )
}

export default AppRail
