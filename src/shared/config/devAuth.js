/**
 * Modo desarrollo: auth desactivado temporalmente para probar vistas sin login.
 * Solo activo cuando VITE_AUTH_DISABLED=true (nunca en producción).
 */
export const isAuthDisabled = () =>
  !import.meta.env.PROD && import.meta.env.VITE_AUTH_DISABLED === 'true'

export const DEV_MOCK_TOKEN = 'dev-bypass-no-backend'

export const DEV_MOCK_USER = {
  id: 'dev-local-user',
  _id: 'dev-local-user',
  nombre: 'Usuario Dev',
  username: 'devuser',
  email: 'dev@signtrack.local',
  rol: 'ADMIN_ROLE',
}

export const seedDevAuthIfNeeded = (login) => {
  if (!isAuthDisabled()) return
  login(DEV_MOCK_TOKEN, DEV_MOCK_USER, null)
}
