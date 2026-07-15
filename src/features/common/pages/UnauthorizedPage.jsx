import { Link } from 'react-router-dom'

const UnauthorizedPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">403</h1>
        <p className="text-2xl text-slate-300 mb-4">Acceso denegado</p>
        <p className="text-slate-400 mb-8">No tienes permiso para acceder a este recurso.</p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}

export default UnauthorizedPage
