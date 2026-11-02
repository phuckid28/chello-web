// Role & permission matrix — web mirror of chello-api src/utils/permissions.js (contract v7 §3).
// The API is the source of truth and enforces everything; this module only drives what the UI shows.

export const WORKSPACE_ROLES = Object.freeze(['owner', 'admin', 'member', 'guest', 'viewer'])
export const BOARD_ROLES = Object.freeze(['admin', 'editor', 'commenter', 'viewer'])

export const PERMISSIONS = Object.freeze({
  WORKSPACE_VIEW: 'workspace:view',
  WORKSPACE_MANAGE: 'workspace:manage',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_TRANSFER: 'workspace:transfer',
  MEMBER_MANAGE: 'member:manage',
  BOARD_CREATE: 'board:create',
  BOARD_VIEW: 'board:view',
  BOARD_COMMENT: 'board:comment',
  BOARD_EDIT: 'board:edit',
  BOARD_MANAGE: 'board:manage'
})

const WORKSPACE_MATRIX = Object.freeze({
  owner: ['workspace:view', 'workspace:manage', 'workspace:delete', 'workspace:transfer', 'member:manage', 'board:create'],
  admin: ['workspace:view', 'workspace:manage', 'member:manage', 'board:create'],
  member: ['workspace:view', 'board:create'],
  guest: ['workspace:view'],
  viewer: ['workspace:view']
})

const BOARD_MATRIX = Object.freeze({
  admin: ['board:view', 'board:comment', 'board:edit', 'board:manage'],
  editor: ['board:view', 'board:comment', 'board:edit'],
  commenter: ['board:view', 'board:comment'],
  viewer: ['board:view']
})

const WORKSPACE_TO_BOARD_ROLE = Object.freeze({
  owner: 'admin',
  admin: 'admin',
  member: 'editor',
  guest: null,
  viewer: 'viewer'
})

const SCALES = { workspace: WORKSPACE_ROLES, board: BOARD_ROLES }
const MATRICES = { workspace: WORKSPACE_MATRIX, board: BOARD_MATRIX }

export const permissionsForRole = (scope, role) => [...((MATRICES[scope] || {})[role] || [])]

export const canWorkspace = (role, permission) => permissionsForRole('workspace', role).includes(permission)
export const canBoard = (role, permission) => permissionsForRole('board', role).includes(permission)

// > 0 when roleA is more powerful than roleB within the same scale; unknown roles rank lowest
export const compareRoles = (scope, roleA, roleB) => {
  const scale = SCALES[scope] || []
  const rank = (role) => {
    const index = scale.indexOf(role)
    return index === -1 ? -1 : scale.length - index
  }
  return rank(roleA) - rank(roleB)
}

export const impliedBoardRole = (workspaceRole) => WORKSPACE_TO_BOARD_ROLE[workspaceRole] ?? null

// Effective board role = max(explicit board role, role implied by the workspace membership)
export const effectiveBoardRole = (explicitRole, workspaceRole) => {
  const implied = impliedBoardRole(workspaceRole)
  const candidates = [explicitRole, implied].filter(role => BOARD_ROLES.includes(role))
  if (candidates.length === 0) return null
  return candidates.reduce((best, role) => (compareRoles('board', role, best) > 0 ? role : best))
}

const isWorkspacePermission = (permission) => !String(permission).startsWith('board:') || permission === 'board:create'

/**
 * Resource-aware permission check used by `useCan`.
 * - `resource.permissions` (server-computed array) wins when present.
 * - otherwise `resource.myRole` is evaluated against the matrix of the permission's scope.
 * - a global admin user (`currentUser.role === 'admin'`) is allowed everywhere.
 * - legacy resources without role info stay permissive (the API still enforces access).
 */
export const can = (resource, permission, currentUser = null) => {
  if (currentUser?.role === 'admin') return true
  if (!resource) return true
  if (Array.isArray(resource.permissions)) return resource.permissions.includes(permission)
  const role = resource.myRole
  if (!role) return true
  if (BOARD_ROLES.includes(role) && !WORKSPACE_ROLES.includes(role)) return canBoard(role, permission)
  if (WORKSPACE_ROLES.includes(role) && !BOARD_ROLES.includes(role)) {
    return isWorkspacePermission(permission)
      ? canWorkspace(role, permission)
      : canBoard(impliedBoardRole(role), permission)
  }
  // Roles shared by both scales ('admin', 'viewer'): pick the matrix matching the permission
  return isWorkspacePermission(permission) ? canWorkspace(role, permission) : canBoard(role, permission)
}
