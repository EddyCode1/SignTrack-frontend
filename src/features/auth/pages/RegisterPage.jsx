import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../../shared/api/services/authService'
import toast from 'react-hot-toast'
import { APP_ROUTES } from '../../../shared/config/paths'

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', surname: '', username: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await authService.register(form)
    if (result.success) {
      toast.success('Usuario registrado exitosamente')
      navigate(APP_ROUTES.login)
    }
    setLoading(false)
  }

  return (
    <div className="auth-form">
      <h2 className="auth-form__title">Crear cuenta</h2>
      <p className="auth-form__subtitle">Únete a la plataforma inclusiva SignTrack</p>

      <form onSubmit={handleSubmit} className="auth-form__fields">
        <div className="auth-form__row">
          <label className="field">
            <span className="field__label">Nombre</span>
            <input name="name" value={form.name} onChange={handleChange} className="field__input" required />
          </label>
          <label className="field">
            <span className="field__label">Apellido</span>
            <input name="surname" value={form.surname} onChange={handleChange} className="field__input" required />
          </label>
        </div>
        <label className="field">
          <span className="field__label">Usuario</span>
          <input name="username" value={form.username} onChange={handleChange} className="field__input" required />
        </label>
        <label className="field">
          <span className="field__label">Correo electrónico</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="field__input" required />
        </label>
        <label className="field">
          <span className="field__label">Contraseña</span>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="field__input" required minLength={8} />
        </label>
        <label className="field">
          <span className="field__label">Teléfono</span>
          <input name="phone" value={form.phone} onChange={handleChange} className="field__input" required pattern="\d{8}" maxLength={8} />
        </label>
        <button type="submit" disabled={loading} className="btn-brand btn-brand--full">
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="auth-form__footer">
        ¿Ya tienes cuenta?{' '}
        <Link to={APP_ROUTES.login} className="auth-form__link">Inicia sesión</Link>
      </p>
    </div>
  )
}

export default RegisterPage
