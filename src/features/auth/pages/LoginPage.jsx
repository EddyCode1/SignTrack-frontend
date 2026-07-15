import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { authService } from '../../../shared/api/services/authService'
import { APP_ROUTES } from '../../../shared/config/paths'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await authService.login(email, password)
    if (result.success) {
      login(result.token, result.user, result.refreshToken)
      navigate(APP_ROUTES.dashboard)
    }
    setLoading(false)
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white text-center mb-8">SignTrack</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Correo o usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>
      <p className="text-center text-white/60 mt-6">
        ¿No tienes cuenta?{' '}
        <Link to={APP_ROUTES.register} className="text-white hover:underline">Regístrate</Link>
      </p>
    </div>
  )
}

export default LoginPage
