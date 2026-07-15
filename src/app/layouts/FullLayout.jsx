import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

/**
 * Layout de pantalla completa con sidebar y botón flotante
 */
const FullLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <div className="w-full h-screen bg-[var(--bg)] overflow-hidden relative">

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Botón flotante en esquina superior izquierda */}
      <button
        type="button"
        onClick={handleToggleSidebar}
        className="absolute top-6 z-50 inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-400 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white transition-all duration-300 font-bold text-lg"
        style={{
          left: '24px',
          marginLeft: isSidebarOpen ? '288px' : '0px'
        }}
        
        aria-label={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
      >
        {isSidebarOpen ? '⟩' : '⟨'}
      </button>

      {/* Página a pantalla completa */}
      <main className="w-full h-full overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default FullLayout
