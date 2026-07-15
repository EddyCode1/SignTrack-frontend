export const ROLES = {
  ADMIN: 'ADMIN_ROLE',
  USER: 'USER_ROLE',
}

export const normalizeRole = (role) => String(role || '').trim().toUpperCase()

export const isAdminRole = (role) => normalizeRole(role) === ROLES.ADMIN

export const isPrivilegedRole = (role) => isAdminRole(role)
