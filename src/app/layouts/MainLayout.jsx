import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NavbarBlack from '../components/NavbarBlack'

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
    <div className="flex h-screen bg-[var(--bg)]">
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
  )
}

export default MainLayout
