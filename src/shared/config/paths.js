/** Prefijo de rutas SignTrack (vite base: /signtrack/) */
export const APP_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

/** Rutas relativas al basename (Link, navigate, createBrowserRouter) */
export const APP_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  dashboardChats: '/dashboard/chats',
  dashboardCalls: '/dashboard/calls',
  dashboardTasks: '/dashboard/tasks',
  dashboardCalendar: '/dashboard/calendar',
  dashboardUsers: '/dashboard/users',
  dashboardGroups: '/dashboard/groups',
  dashboardContacts: '/dashboard/contacts',
  dashboardGroupDetail: '/dashboard/groups/:groupId',
  dashboardRequests: '/dashboard/requests',
  dashboardProfile: '/dashboard/profile',
  unauthorized: '/unauthorized',
}

export const buildDashboardGroupDetailPath = (groupId) =>
  APP_ROUTES.dashboardGroupDetail.replace(':groupId', String(groupId))

/** Ruta absoluta en el navegador (window.location, comparaciones pathname) */
export const appPath = (route) => `${APP_BASENAME}${route}`

export const APP_PATHS = {
  home: appPath(APP_ROUTES.home),
  login: appPath(APP_ROUTES.login),
  register: appPath(APP_ROUTES.register),
  forgotPassword: appPath(APP_ROUTES.forgotPassword),
  resetPassword: appPath(APP_ROUTES.resetPassword),
  dashboard: appPath(APP_ROUTES.dashboard),
  dashboardChats: appPath(APP_ROUTES.dashboardChats),
  dashboardCalls: appPath(APP_ROUTES.dashboardCalls),
  dashboardTasks: appPath(APP_ROUTES.dashboardTasks),
  dashboardCalendar: appPath(APP_ROUTES.dashboardCalendar),
  dashboardUsers: appPath(APP_ROUTES.dashboardUsers),
  dashboardGroups: appPath(APP_ROUTES.dashboardGroups),
  dashboardContacts: appPath(APP_ROUTES.dashboardContacts),
  dashboardRequests: appPath(APP_ROUTES.dashboardRequests),
  dashboardProfile: appPath(APP_ROUTES.dashboardProfile),
  unauthorized: appPath(APP_ROUTES.unauthorized),
}
