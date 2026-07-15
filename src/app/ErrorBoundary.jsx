import { useRouteError } from 'react-router-dom'

export function ErrorBoundary() {
  const error = useRouteError()

  console.error('Route Error:', error)

  // Handle different error types
  if (error?.status === 404) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <p className="text-2xl text-slate-300 mb-4">Página no encontrada</p>
          <p className="text-slate-400 mb-8 max-w-md">
            La ruta "{error?.pathname || 'desconocida'}" no existe. Verifica la dirección e intenta de nuevo.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  if (error?.status === 401 || error?.status === 403) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-white mb-4">{error.status}</h1>
          <p className="text-2xl text-slate-300 mb-4">Acceso denegado</p>
          <p className="text-slate-400 mb-8">
            No tienes permiso para acceder a este recurso.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center px-4 max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-4">¡Algo salió mal!</h1>
        <p className="text-lg text-slate-300 mb-4">
          Se ha producido un error inesperado. Por favor, intenta de nuevo o contacta al soporte.
        </p>
        <div className="bg-slate-800 rounded-lg p-4 mb-8 text-left max-h-40 overflow-auto">
          <p className="text-red-400 font-mono text-sm">
            {error?.statusText ||
              error?.message ||
              'Error desconocido'}
          </p>
          {error?.data && (
            <p className="text-slate-400 font-mono text-xs mt-2">
              {typeof error.data === 'string' ? error.data : JSON.stringify(error.data)}
            </p>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Volver atrás
          </button>
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
