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
    <div className="auth-form">
      <h2 className="auth-form__title">Iniciar sesión</h2>
      <p className="auth-form__subtitle">Accede a tu espacio de trabajo SignTrack</p>

      <form onSubmit={handleSubmit} className="auth-form__fields">
        <label className="field">
          <span className="field__label">Correo o usuario</span>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field__input"
            required
            autoComplete="username"
          />
        </label>
        <label className="field">
          <span className="field__label">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field__input"
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-brand btn-brand--full">
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="auth-form__footer text-center">
        <Link to={APP_ROUTES.forgotPassword} className="auth-form__link">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>

      <p className="auth-form__footer">
        ¿No tienes cuenta?{' '}
        <Link to={APP_ROUTES.register} className="auth-form__link">Regístrate</Link>
      </p>
    </div>
  )
}

export default LoginPage
