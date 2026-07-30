import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import useAuthStore from '../../shared/stores/useAuthStore'
import { isAdminRole, normalizeRole } from '../../shared/utils/roles'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const currentRole = normalizeRole(user?.rol)
    const acceptedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasAccess = acceptedRoles.some((role) => {
      const normalized = normalizeRole(role)
      if (normalized === 'ADMIN_ROLE') {
        return isAdminRole(currentRole)
      }
      return currentRole === normalized
    })

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
}

export default ProtectedRoute
