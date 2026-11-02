// Pure helpers for the multi-level workspace tree (contract v7 §3).
// Organization (level 0) → Space (level 1) → Team (level 2). Max depth 3 (levels 0–2).
import { WORKSPACE_ROLES } from '~/utils/permissions'

export const MAX_WORKSPACE_LEVEL = 2
export const INDENT_STEP = 2

const LEVEL_LABEL_KEYS = ['wsLevelOrganization', 'wsLevelSpace', 'wsLevelTeam']

const ROLE_LABEL_KEYS = Object.freeze({
  owner: 'v7RoleOwner',
  admin: 'v7RoleAdmin',
  member: 'v7RoleMember',
  guest: 'v7RoleGuest',
  viewer: 'v7RoleViewer',
  editor: 'v7RoleEditor',
  commenter: 'v7RoleCommenter'
})

const childrenOf = (node) => (Array.isArray(node?.children) ? node.children : [])
const asList = (tree) => (Array.isArray(tree) ? tree : [])

// Pre-order list of `{ node, depth, parentId }`
export const flattenTree = (tree) => {
  const walk = (nodes, depth, parentId) => nodes.flatMap(node => [
    { node, depth, parentId },
    ...walk(childrenOf(node), depth + 1, node._id)
  ])
  return walk(asList(tree), 0, null)
}

export const findNode = (tree, id) => {
  if (!id) return null
  const entry = flattenTree(tree).find(item => item.node._id === id)
  return entry ? entry.node : null
}

// Nodes from the root down to (and including) `id`; [] when not found
export const findPath = (tree, id) => {
  const search = (nodes, trail) => {
    for (const node of nodes) {
      const nextTrail = [...trail, node]
      if (node._id === id) return nextTrail
      const found = search(childrenOf(node), nextTrail)
      if (found) return found
    }
    return null
  }
  return id ? search(asList(tree), []) || [] : []
}

export const buildBreadcrumb = (tree, id) => findPath(tree, id).map(({ _id, name }) => ({ _id, name }))

export const nodeLevel = (node, fallbackDepth = 0) => (Number.isInteger(node?.level) ? node.level : fallbackDepth)

export const levelLabelKey = (level) => LEVEL_LABEL_KEYS[Math.min(Math.max(level || 0, 0), MAX_WORKSPACE_LEVEL)]

export const canHaveChildren = (node, fallbackDepth = 0) => nodeLevel(node, fallbackDepth) < MAX_WORKSPACE_LEVEL

// 0 for a leaf, 1 + tallest child otherwise
export const subtreeHeight = (node) => {
  const kids = childrenOf(node)
  return kids.length === 0 ? 0 : 1 + Math.max(...kids.map(subtreeHeight))
}

export const collectDescendantIds = (node) => new Set(flattenTree(childrenOf(node)).map(entry => entry.node._id))

/**
 * Valid new parents for `nodeId`: not itself, not a descendant, not its current parent,
 * and deep enough room so the whole moved subtree stays within MAX_WORKSPACE_LEVEL.
 * `predicate(node)` lets callers add extra rules (e.g. `workspace:manage` on the target).
 */
export const getValidMoveTargets = (tree, nodeId, predicate = () => true) => {
  const flat = flattenTree(tree)
  const self = flat.find(entry => entry.node._id === nodeId)
  if (!self) return []
  const descendants = collectDescendantIds(self.node)
  const height = subtreeHeight(self.node)
  return flat.filter(({ node, depth }) => {
    if (node._id === nodeId || descendants.has(node._id) || node._id === self.parentId) return false
    if (nodeLevel(node, depth) + 1 + height > MAX_WORKSPACE_LEVEL) return false
    return predicate(node)
  })
}

export const canMoveToRoot = (node) => Boolean(node?.parentId)

// Flat, indented options for <Select>: `{ value, label, depth, indent, icon, color, disabled, node }`
export const buildSelectOptions = (tree, { filter = () => true, isDisabled = () => false } = {}) =>
  flattenTree(tree)
    .filter(({ node }) => filter(node))
    .map(({ node, depth }) => ({
      value: node._id,
      label: node.name,
      depth,
      indent: depth * INDENT_STEP,
      icon: node.icon || '',
      color: node.color || '',
      disabled: Boolean(isDisabled(node)),
      node
    }))

export const roleLabelKey = (role) => ROLE_LABEL_KEYS[role] || null

// Only owners (or global admins) may grant the owner role
export const assignableWorkspaceRoles = (myRole, isGlobalAdmin = false) =>
  (myRole === 'owner' || isGlobalAdmin ? [...WORKSPACE_ROLES] : WORKSPACE_ROLES.filter(role => role !== 'owner'))

export const inviteLinkRoles = () => WORKSPACE_ROLES.filter(role => role !== 'owner')

/**
 * Explicit vs inherited membership, resolving the ancestor name from the page breadcrumb
 * first and the workspace tree second. `{ kind: 'explicit'|'inherited', sourceName }`
 */
export const describeMembership = (entry, { breadcrumb = [], tree = [] } = {}) => {
  if (!entry?.inherited) return { kind: 'explicit', sourceName: null }
  const sourceId = entry.sourceWorkspaceId
  const crumb = breadcrumb.find(item => item._id === sourceId)
  const node = crumb ? null : findNode(tree, sourceId)
  return { kind: 'inherited', sourceName: crumb?.name || node?.name || null }
}
