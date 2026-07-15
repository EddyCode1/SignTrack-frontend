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
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white text-center mb-8">Crear Cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" required />
          <input name="surname" placeholder="Apellido" value={form.surname} onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" required />
        </div>
        <input name="username" placeholder="Usuario" value={form.username} onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" required />
        <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" required />
        <input name="password" type="password" placeholder="Contraseña (mín. 8 caracteres)" value={form.password} onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" required minLength={8} />
        <input name="phone" placeholder="Teléfono (8 dígitos)" value={form.phone} onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40" required />
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition disabled:opacity-50">
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p className="text-center text-white/60 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link to={APP_ROUTES.login} className="text-white hover:underline">Inicia sesión</Link>
      </p>
    </div>
  )
}

export default RegisterPage
