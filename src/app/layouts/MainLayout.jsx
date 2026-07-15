import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NavbarBlack from '../components/NavbarBlack'
import { isAuthDisabled } from '../../shared/config/devAuth'

/**
 * Layout principal con Sidebar y NavbarBlack
 * Usado en rutas protegidas
 */
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="flex h-screen bg-[var(--bg)] flex-col">
      {isAuthDisabled() && (
        <div
          className="shrink-0 bg-amber-500 text-black text-center text-sm py-1.5 px-4 font-medium"
          role="status"
        >
          Modo dev: auth desactivado — solo pruebas de UI (VITE_AUTH_DISABLED=true)
        </div>
      )}
      <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* NavbarBlack */}
        <NavbarBlack isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />

        {/* Página */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </div>
  )
}

export default MainLayout
