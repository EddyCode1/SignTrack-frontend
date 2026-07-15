import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/config/paths'

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-slate-300 mb-8">Página no encontrada</p>
        <Link
          to={APP_ROUTES.login}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
