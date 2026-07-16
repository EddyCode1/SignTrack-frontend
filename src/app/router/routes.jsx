import { createBrowserRouter, Navigate } from 'react-router-dom'
import { isAuthDisabled } from '../../shared/config/devAuth'
import { APP_BASENAME, APP_ROUTES } from '../../shared/config/paths'

import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import ErrorBoundary from '../ErrorBoundary'

import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage'
import NotFoundPage from '../../features/common/pages/NotFoundPage'
import UnauthorizedPage from '../../features/common/pages/UnauthorizedPage'
import ChatsPage from '../../features/chats/pages/ChatsPage'
import ChatRoomPage from '../../features/chats/pages/ChatRoomPage'
import CallsPage from '../../features/calls/pages/CallsPage'
import CallRoomPage from '../../features/calls/pages/CallRoomPage'
import TasksPage from '../../features/tasks/pages/TasksPage'
import CalendarPage from '../../features/calendar/pages/CalendarPage'
import ContactsPage from '../../features/contacts/pages/ContactsPage'
import DashboardPage from '../../features/dashboard/pages/DashboardPage'
import UsersPage from '../../features/users/pages/UsersPage'
import ProfilePage from '../../features/users/pages/ProfilePage'
import GroupsPage from '../../features/groups/pages/GroupsPage'
import GroupDetailPage from '../../features/groups/pages/GroupDetailPage'
import RequestsPage from '../../features/requests/pages/RequestsPage'

import ProtectedRoute from './ProtectedRoute'

const HomeRedirect = () => (
  <Navigate
    to={isAuthDisabled() ? APP_ROUTES.dashboard : APP_ROUTES.login}
    replace
  />
)

const router = createBrowserRouter(
  [
  {
    path: APP_ROUTES.home,
    element: <HomeRedirect />,
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
    path: APP_ROUTES.forgotPassword,
    element: (
      <AuthLayout>
        <ForgotPasswordPage />
      </AuthLayout>
    ),
  },
  {
    path: APP_ROUTES.resetPassword,
    element: (
      <AuthLayout>
        <ResetPasswordPage />
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
        path: 'chats',
        element: <ChatsPage />,
      },
      {
        path: 'chats/:conversationId',
        element: <ChatRoomPage />,
      },
      {
        path: 'calls',
        element: <CallsPage />,
      },
      {
        path: 'calls/:roomId',
        element: <CallRoomPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
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
        path: 'groups',
        element: <GroupsPage />,
      },
      {
        path: 'contacts',
        element: <ContactsPage />,
      },
      {
        path: 'groups/:groupId',
        element: <GroupDetailPage />,
      },
      {
        path: 'requests',
        element: <RequestsPage />,
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
