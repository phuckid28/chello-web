import { describe, it, expect } from 'vitest'
import {
  BOARD_ROLES,
  WORKSPACE_ROLES,
  can,
  canBoard,
  canWorkspace,
  impliedBoardRole,
  effectiveBoardRole,
  permissionsForRole,
  compareRoles
} from '~/utils/permissions'

describe('permissions — workspace matrix (contract §3)', () => {
  it('lists roles from most to least powerful', () => {
    expect(WORKSPACE_ROLES).toEqual(['owner', 'admin', 'member', 'guest', 'viewer'])
    expect(BOARD_ROLES).toEqual(['admin', 'editor', 'commenter', 'viewer'])
  })

  it('grants workspace:view to every workspace role', () => {
    WORKSPACE_ROLES.forEach(role => expect(canWorkspace(role, 'workspace:view')).toBe(true))
  })

  it('restricts manage/member:manage to owner and admin', () => {
    expect(canWorkspace('owner', 'workspace:manage')).toBe(true)
    expect(canWorkspace('admin', 'workspace:manage')).toBe(true)
    expect(canWorkspace('member', 'workspace:manage')).toBe(false)
    expect(canWorkspace('admin', 'member:manage')).toBe(true)
    expect(canWorkspace('guest', 'member:manage')).toBe(false)
  })

  it('restricts delete/transfer to owner only', () => {
    expect(canWorkspace('owner', 'workspace:delete')).toBe(true)
    expect(canWorkspace('owner', 'workspace:transfer')).toBe(true)
    expect(canWorkspace('admin', 'workspace:delete')).toBe(false)
    expect(canWorkspace('admin', 'workspace:transfer')).toBe(false)
  })

  it('allows board:create for owner, admin, member only', () => {
    expect(canWorkspace('member', 'board:create')).toBe(true)
    expect(canWorkspace('guest', 'board:create')).toBe(false)
    expect(canWorkspace('viewer', 'board:create')).toBe(false)
  })

  it('denies everything for unknown or missing roles', () => {
    expect(canWorkspace(undefined, 'workspace:view')).toBe(false)
    expect(canWorkspace('superhero', 'workspace:view')).toBe(false)
  })
})

describe('permissions — board matrix', () => {
  it('maps board roles to the expected permissions', () => {
    expect(permissionsForRole('board', 'admin')).toEqual(['board:view', 'board:comment', 'board:edit', 'board:manage'])
    expect(permissionsForRole('board', 'editor')).toEqual(['board:view', 'board:comment', 'board:edit'])
    expect(permissionsForRole('board', 'commenter')).toEqual(['board:view', 'board:comment'])
    expect(permissionsForRole('board', 'viewer')).toEqual(['board:view'])
  })

  it('checks single board permissions', () => {
    expect(canBoard('commenter', 'board:comment')).toBe(true)
    expect(canBoard('commenter', 'board:edit')).toBe(false)
    expect(canBoard('viewer', 'board:comment')).toBe(false)
    expect(canBoard('editor', 'board:manage')).toBe(false)
  })

  it('derives implied board role from workspace role', () => {
    expect(impliedBoardRole('owner')).toBe('admin')
    expect(impliedBoardRole('admin')).toBe('admin')
    expect(impliedBoardRole('member')).toBe('editor')
    expect(impliedBoardRole('guest')).toBe(null)
    expect(impliedBoardRole('viewer')).toBe('viewer')
  })

  it('takes the max of explicit and implied board roles', () => {
    expect(effectiveBoardRole('viewer', 'member')).toBe('editor')
    expect(effectiveBoardRole('admin', 'viewer')).toBe('admin')
    expect(effectiveBoardRole(null, 'guest')).toBe(null)
    expect(effectiveBoardRole('commenter', null)).toBe('commenter')
  })

  it('compares roles within a scale', () => {
    expect(compareRoles('board', 'admin', 'viewer')).toBeGreaterThan(0)
    expect(compareRoles('workspace', 'guest', 'member')).toBeLessThan(0)
    expect(compareRoles('board', 'editor', 'editor')).toBe(0)
  })
})

describe('can() — resource-aware check', () => {
  it('prefers the server-provided permissions array when present', () => {
    const board = { myRole: 'viewer', permissions: ['board:view', 'board:comment'] }
    expect(can(board, 'board:comment')).toBe(true)
    expect(can(board, 'board:edit')).toBe(false)
  })

  it('falls back to myRole for boards and workspaces', () => {
    expect(can({ myRole: 'editor' }, 'board:edit')).toBe(true)
    expect(can({ myRole: 'member' }, 'board:create')).toBe(true)
    expect(can({ myRole: 'guest' }, 'workspace:manage')).toBe(false)
  })

  it('treats a global admin user as allowed everywhere', () => {
    expect(can({ myRole: 'viewer' }, 'board:manage', { role: 'admin' })).toBe(true)
  })

  it('stays permissive for legacy resources without role info (backward compatible)', () => {
    expect(can({ title: 'Old board' }, 'board:edit')).toBe(true)
    expect(can(null, 'board:edit')).toBe(true)
  })
})
