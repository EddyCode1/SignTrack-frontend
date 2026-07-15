import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import NavbarBlack from '../components/NavbarBlack'
import { isAuthDisabled } from '../../shared/config/devAuth'

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
        <Sidebar isOpen={isSidebarOpen} />

        <div
          className="flex-1 flex flex-col min-w-0 overflow-hidden transition-[margin] duration-300 ease-in-out"
          style={{ marginLeft: isSidebarOpen ? '288px' : '0' }}
        >
          <NavbarBlack onToggleSidebar={handleToggleSidebar} />

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>

        <aside
          className="hidden xl:flex w-14 shrink-0 flex-col items-center border-l border-gray-200 bg-[var(--surface)] pt-4"
          aria-hidden="true"
        >
          <span
            className="text-[10px] uppercase tracking-wider text-[var(--muted)] [writing-mode:vertical-rl] rotate-180"
            title="Panel lateral — próximamente"
          >
            Panel
          </span>
        </aside>
      </div>
    </div>
  )
}

export default MainLayout
