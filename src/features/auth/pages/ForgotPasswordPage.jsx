import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../../shared/api/services/authService'
import { APP_ROUTES } from '../../../shared/config/paths'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await authService.forgotPassword(email)
    if (result.success) setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">Recuperar contraseña</h2>
      <p className="auth-form__subtitle">
        Te enviaremos instrucciones si el correo está registrado.
      </p>

      {sent ? (
        <div className="auth-form__fields">
          <p className="text-[var(--muted)] text-sm">
            Si el correo existe en SignTrack, recibirás un enlace de recuperación.
            En desarrollo, revisa los logs del servidor si SMTP está desactivado.
          </p>
          <Link to={APP_ROUTES.login} className="btn-brand btn-brand--full text-center">
            Volver al login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form__fields">
          <label className="field">
            <span className="field__label">Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field__input"
              required
              autoComplete="email"
            />
          </label>
          <button type="submit" disabled={loading} className="btn-brand btn-brand--full">
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      )}

      <p className="auth-form__footer">
        <Link to={APP_ROUTES.login} className="auth-form__link">
          Volver al login
        </Link>
      </p>
    </div>
  )
}

export default ForgotPasswordPage
