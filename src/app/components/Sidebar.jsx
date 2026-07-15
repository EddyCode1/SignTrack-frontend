import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../shared/stores/useAuthStore'
import {
  FiCalendar,
  FiCheckSquare,
  FiHome,
  FiInbox,
  FiMessageSquare,
  FiPhone,
  FiUser,
  FiUserPlus,
  FiUsers,
} from 'react-icons/fi'
import { isAdminRole } from '../../shared/utils/roles'
import { APP_ROUTES } from '../../shared/config/paths'

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
    isActive
      ? 'bg-white text-black font-medium'
      : 'text-white/90 hover:bg-white/10 hover:text-white'
  }`

const Sidebar = ({ isOpen = true }) => {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(APP_ROUTES.login)
  }

  const isAdmin = isAdminRole(user?.rol)

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full overflow-hidden bg-black text-white flex flex-col z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72 border-r border-white/10 opacity-100 translate-x-0' : 'w-72 opacity-0 -translate-x-full pointer-events-none'}
      `}
    >
      <div className="p-6">
        <div className="mt-5">
          <h1 className="text-2xl font-bold text-white">SignTrack</h1>
          <p className="mt-2 text-sm text-white/65">Traducción de lenguaje de señas</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 space-y-1">
        <NavLink to={APP_ROUTES.dashboard} end className={navLinkClass}>
          <FiHome size={17} aria-hidden="true" />
          <span>Inicio</span>
        </NavLink>

        <NavLink to={APP_ROUTES.dashboardChats} className={navLinkClass}>
          <FiMessageSquare size={17} aria-hidden="true" />
          <span>Chats</span>
        </NavLink>

        <NavLink to={APP_ROUTES.dashboardCalls} className={navLinkClass}>
          <FiPhone size={17} aria-hidden="true" />
          <span>Llamadas</span>
        </NavLink>

        <NavLink to={APP_ROUTES.dashboardTasks} className={navLinkClass}>
          <FiCheckSquare size={17} aria-hidden="true" />
          <span>Tareas</span>
        </NavLink>

        <NavLink to={APP_ROUTES.dashboardCalendar} className={navLinkClass}>
          <FiCalendar size={17} aria-hidden="true" />
          <span>Calendario</span>
        </NavLink>

        <NavLink to={APP_ROUTES.dashboardGroups} className={navLinkClass}>
          <FiUserPlus size={17} aria-hidden="true" />
          <span>Grupos</span>
        </NavLink>

        <NavLink to={APP_ROUTES.dashboardRequests} className={navLinkClass}>
          <FiInbox size={17} aria-hidden="true" />
          <span>Solicitudes</span>
        </NavLink>

        <div className="my-3 border-t border-white/10" />

        <NavLink to={APP_ROUTES.dashboardProfile} className={navLinkClass}>
          <FiUser size={17} aria-hidden="true" />
          <span>Mi Perfil</span>
        </NavLink>

        {isAdmin && (
          <NavLink to={APP_ROUTES.dashboardUsers} className={navLinkClass}>
            <FiUsers size={17} aria-hidden="true" />
            <span>Usuarios</span>
          </NavLink>
        )}
      </nav>

      <div className="px-6 pb-6">
        <div className="rounded-2xl bg-[var(--bg)] p-4 border border-[var(--accent-soft)]">
          <p className="text-xs text-[var(--muted)]">Usuario conectado</p>
          <p className="mt-2 font-semibold text-[var(--text)] truncate">{user?.nombre || user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full px-4 py-2 bg-[var(--accent)] text-[var(--surface)] rounded-xl hover:bg-[#4b5563] transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
