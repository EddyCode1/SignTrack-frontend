import { FiMenu, FiSearch } from 'react-icons/fi'
import useAuthStore from '../../shared/stores/useAuthStore'

const AppHeader = ({ onMenuClick, title = 'SignTrack' }) => {
  const user = useAuthStore((state) => state.user)
  const initials = (user?.nombre || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__menu md:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <FiMenu size={22} />
        </button>
        <h2 className="app-header__title">{title}</h2>
      </div>

      <div className="app-header__search">
        <FiSearch className="app-header__search-icon" size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar en SignTrack..."
          className="app-header__search-input"
          aria-label="Buscar"
        />
      </div>

      <div className="app-header__user">
        <div className="app-header__avatar" title={user?.email || ''}>
          {initials}
        </div>
        <div className="app-header__user-meta hidden sm:block">
          <span className="app-header__user-name">{user?.nombre || 'Usuario'}</span>
          <span className="app-header__user-role">{user?.rol?.replace('_ROLE', '') || ''}</span>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
