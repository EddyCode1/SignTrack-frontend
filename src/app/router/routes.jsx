import { createBrowserRouter, Navigate } from 'react-router-dom'
import { isAuthDisabled } from '../../shared/config/devAuth'
import { APP_BASENAME, APP_ROUTES } from '../../shared/config/paths'

import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import ErrorBoundary from '../ErrorBoundary'

import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import NotFoundPage from '../../features/common/pages/NotFoundPage'
import UnauthorizedPage from '../../features/common/pages/UnauthorizedPage'
import DashboardPage from '../../features/dashboard/pages/DashboardPage'
import UsersPage from '../../features/users/pages/UsersPage'
import ProfilePage from '../../features/users/pages/ProfilePage'

import ProtectedRoute from './ProtectedRoute'

const homeRedirect = isAuthDisabled() ? APP_ROUTES.dashboard : APP_ROUTES.login

const router = createBrowserRouter(
  [
  {
    path: APP_ROUTES.home,
    element: <Navigate to={homeRedirect} replace />,
  },
  {
    path: APP_ROUTES.login,
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: APP_ROUTES.register,
    element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    ),
  },
  {
    path: APP_ROUTES.dashboard,
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRole={'ADMIN_ROLE'}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: APP_ROUTES.unauthorized,
    element: <UnauthorizedPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorBoundary />,
  },
  ],
  { basename: APP_BASENAME || undefined },
)

export default router
