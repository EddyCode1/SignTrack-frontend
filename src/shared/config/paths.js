/** Prefijo de rutas SignTrack (vite base: /signtrack/) */
export const APP_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

/** Rutas relativas al basename (Link, navigate, createBrowserRouter) */
export const APP_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  dashboardUsers: '/dashboard/users',
  dashboardProfile: '/dashboard/profile',
  unauthorized: '/unauthorized',
}

/** Ruta absoluta en el navegador (window.location, comparaciones pathname) */
export const appPath = (route) => `${APP_BASENAME}${route}`

export const APP_PATHS = {
  home: appPath(APP_ROUTES.home),
  login: appPath(APP_ROUTES.login),
  register: appPath(APP_ROUTES.register),
  dashboard: appPath(APP_ROUTES.dashboard),
  dashboardUsers: appPath(APP_ROUTES.dashboardUsers),
  dashboardProfile: appPath(APP_ROUTES.dashboardProfile),
  unauthorized: appPath(APP_ROUTES.unauthorized),
}
