import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AppRail from '../components/AppRail'
import AppHeader from '../components/AppHeader'
import PresenceProvider from '../providers/PresenceProvider'
import CallInviteProvider from '../providers/CallInviteProvider'
import ConnectionBanner from '../../shared/components/ConnectionBanner'
import { isAuthDisabled } from '../../shared/config/devAuth'
import { APP_ROUTES } from '../../shared/config/paths'

const routeTitles = {
  [APP_ROUTES.dashboard]: 'Inicio',
  [APP_ROUTES.dashboardChats]: 'Chats',
  [APP_ROUTES.dashboardCalls]: 'Llamadas',
  [APP_ROUTES.dashboardGroups]: 'Grupos',
  [APP_ROUTES.dashboardRequests]: 'Solicitudes',
  [APP_ROUTES.dashboardTasks]: 'Tareas',
  [APP_ROUTES.dashboardCalendar]: 'Calendario',
  [APP_ROUTES.dashboardProfile]: 'Mi perfil',
  [APP_ROUTES.dashboardUsers]: 'Usuarios',
}

const MainLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  const pathname = location.pathname.replace(/\/$/, '') || APP_ROUTES.dashboard
  const headerTitle =
    routeTitles[pathname] ||
    (pathname.includes('/groups/') ? 'Detalle de grupo' : 'SignTrack')

  return (
    <PresenceProvider>
    <CallInviteProvider>
    <div className="app-shell">
      {isAuthDisabled() && (
        <div className="app-dev-banner" role="status">
          Modo dev: auth desactivado — solo pruebas de UI
        </div>
      )}
      <ConnectionBanner />

      <div className="app-shell__body">
        <AppRail
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        <div className="app-shell__main">
          <AppHeader
            title={headerTitle}
            onMenuClick={() => setMobileNavOpen(true)}
          />

          <main className="app-main" key={location.pathname}>
            <div className="app-main__inner page-enter">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
    </CallInviteProvider>
    </PresenceProvider>
  )
}

export default MainLayout
