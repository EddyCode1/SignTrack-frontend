import { createBrowserRouter, Navigate } from 'react-router-dom'

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

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    ),
  },
  {
    path: '/dashboard',
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
    path: '/unauthorized',
    element: <UnauthorizedPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorBoundary />,
  },
])

export default router
