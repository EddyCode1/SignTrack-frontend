import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../../../shared/api/services/authService'
import { APP_ROUTES } from '../../../shared/config/paths'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      return
    }
    setLoading(true)
    const result = await authService.resetPassword(token, password)
    if (result.success) {
      navigate(APP_ROUTES.login)
    }
    setLoading(false)
  }

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">Nueva contraseña</h2>
      <p className="auth-form__subtitle">Ingresa el token de recuperación y tu nueva contraseña.</p>

      <form onSubmit={handleSubmit} className="auth-form__fields">
        <label className="field">
          <span className="field__label">Token de recuperación</span>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="field__input"
            required
          />
        </label>
        <label className="field">
          <span className="field__label">Nueva contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field__input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className="field">
          <span className="field__label">Confirmar contraseña</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field__input"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {password && confirm && password !== confirm && (
          <p className="text-sm text-red-500">Las contraseñas no coinciden</p>
        )}
        <button
          type="submit"
          disabled={loading || !token || password.length < 8 || password !== confirm}
          className="btn-brand btn-brand--full"
        >
          {loading ? 'Guardando...' : 'Restablecer contraseña'}
        </button>
      </form>

      <p className="auth-form__footer">
        <Link to={APP_ROUTES.login} className="auth-form__link">
          Volver al login
        </Link>
      </p>
    </div>
  )
}

export default ResetPasswordPage
