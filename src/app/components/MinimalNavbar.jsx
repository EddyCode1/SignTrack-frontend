import { useNavigate } from 'react-router-dom'

/**
 * Navbar minimalista - Solo botón de regreso
 */
const MinimalNavbar = () => {
  const navigate = useNavigate()

  return (
    <header className="border-b border-gray-800 py-3 px-6 bg-black">
      <button
        type="button"
        onClick={() => navigate('/loby')}
        className="inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-400 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white transition-all duration-300 font-bold text-lg"
        aria-label="Volver al menú principal"
        title="Volver"
      >
        ⟨
      </button>
    </header>
  )
}

export default MinimalNavbar
