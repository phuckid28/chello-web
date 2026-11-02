import { describe, it, expect } from 'vitest'
import {
  MAX_WORKSPACE_LEVEL,
  flattenTree,
  findNode,
  findPath,
  buildBreadcrumb,
  nodeLevel,
  canHaveChildren,
  subtreeHeight,
  collectDescendantIds,
  getValidMoveTargets,
  canMoveToRoot,
  buildSelectOptions,
  roleLabelKey,
  levelLabelKey,
  describeMembership,
  assignableWorkspaceRoles,
  inviteLinkRoles
} from '~/utils/workspaceTree'

// org (0) ─┬─ space A (1) ── team A1 (2)
//          └─ space B (1)
// org2 (0)
const tree = [
  {
    _id: 'org',
    name: 'Org',
    level: 0,
    parentId: null,
    myRole: 'owner',
    children: [
      {
        _id: 'spaceA',
        name: 'Space A',
        level: 1,
        parentId: 'org',
        myRole: 'owner',
        children: [{ _id: 'teamA1', name: 'Team A1', level: 2, parentId: 'spaceA', myRole: 'owner', children: [] }]
      },
      { _id: 'spaceB', name: 'Space B', level: 1, parentId: 'org', myRole: 'member', children: [] }
    ]
  },
  { _id: 'org2', name: 'Org 2', level: 0, parentId: null, myRole: 'admin', children: [] }
]

describe('workspaceTree — traversal', () => {
  it('flattens the tree in pre-order with depth', () => {
    const flat = flattenTree(tree)
    expect(flat.map(entry => entry.node._id)).toEqual(['org', 'spaceA', 'teamA1', 'spaceB', 'org2'])
    expect(flat.map(entry => entry.depth)).toEqual([0, 1, 2, 1, 0])
  })

  it('handles empty / invalid input', () => {
    expect(flattenTree(null)).toEqual([])
    expect(findNode(undefined, 'x')).toBeNull()
    expect(findPath([], 'x')).toEqual([])
  })

  it('finds a node by id', () => {
    expect(findNode(tree, 'teamA1')?.name).toBe('Team A1')
    expect(findNode(tree, 'missing')).toBeNull()
  })

  it('finds the path from root to node and builds a breadcrumb', () => {
    expect(findPath(tree, 'teamA1').map(node => node._id)).toEqual(['org', 'spaceA', 'teamA1'])
    expect(buildBreadcrumb(tree, 'spaceB')).toEqual([{ _id: 'org', name: 'Org' }, { _id: 'spaceB', name: 'Space B' }])
  })
})

describe('workspaceTree — levels', () => {
  it('reads node level with a depth fallback', () => {
    expect(nodeLevel({ level: 2 })).toBe(2)
    expect(nodeLevel({}, 1)).toBe(1)
    expect(nodeLevel(null)).toBe(0)
  })

  it('only allows children below the max level', () => {
    expect(MAX_WORKSPACE_LEVEL).toBe(2)
    expect(canHaveChildren(findNode(tree, 'org'))).toBe(true)
    expect(canHaveChildren(findNode(tree, 'spaceA'))).toBe(true)
    expect(canHaveChildren(findNode(tree, 'teamA1'))).toBe(false)
  })

  it('computes subtree height and descendants', () => {
    expect(subtreeHeight(findNode(tree, 'org'))).toBe(2)
    expect(subtreeHeight(findNode(tree, 'spaceA'))).toBe(1)
    expect(subtreeHeight(findNode(tree, 'teamA1'))).toBe(0)
    expect([...collectDescendantIds(findNode(tree, 'org'))].sort()).toEqual(['spaceA', 'spaceB', 'teamA1'])
  })

  it('maps levels to label keys', () => {
    expect(levelLabelKey(0)).toBe('wsLevelOrganization')
    expect(levelLabelKey(1)).toBe('wsLevelSpace')
    expect(levelLabelKey(2)).toBe('wsLevelTeam')
  })
})

describe('workspaceTree — move targets', () => {
  const ids = (entries) => entries.map(entry => entry.node._id)

  it('excludes self, descendants and the current parent', () => {
    expect(ids(getValidMoveTargets(tree, 'spaceA'))).toEqual(['org2'])
  })

  it('excludes targets that would exceed the max depth for the subtree height', () => {
    // teamA1 (height 0) can go under any level-0/1 node except its current parent
    expect(ids(getValidMoveTargets(tree, 'teamA1'))).toEqual(['org', 'spaceB', 'org2'])
    // org (height 2) can never be nested
    expect(ids(getValidMoveTargets(tree, 'org'))).toEqual([])
  })

  it('applies an optional predicate (e.g. permissions)', () => {
    const onlyOwned = (node) => node.myRole === 'owner'
    expect(ids(getValidMoveTargets(tree, 'teamA1', onlyOwned))).toEqual(['org'])
  })

  it('returns nothing for unknown nodes', () => {
    expect(getValidMoveTargets(tree, 'missing')).toEqual([])
  })

  it('allows moving to root only for nested nodes', () => {
    expect(canMoveToRoot(findNode(tree, 'spaceA'))).toBe(true)
    expect(canMoveToRoot(findNode(tree, 'org'))).toBe(false)
  })
})

describe('workspaceTree — select options', () => {
  it('builds indented options for every node', () => {
    const options = buildSelectOptions(tree)
    expect(options.map(option => option.value)).toEqual(['org', 'spaceA', 'teamA1', 'spaceB', 'org2'])
    expect(options[2]).toMatchObject({ value: 'teamA1', depth: 2, label: 'Team A1' })
    expect(options[2].indent).toBeGreaterThan(options[1].indent)
  })

  it('supports filtering and disabling', () => {
    const options = buildSelectOptions(tree, {
      filter: (node) => node._id !== 'org2',
      isDisabled: (node) => node.level === 2
    })
    expect(options.map(option => option.value)).toEqual(['org', 'spaceA', 'teamA1', 'spaceB'])
    expect(options.find(option => option.value === 'teamA1').disabled).toBe(true)
    expect(options.find(option => option.value === 'org').disabled).toBe(false)
  })
})

describe('workspaceTree — roles & membership display', () => {
  it('maps roles to common i18n keys', () => {
    expect(roleLabelKey('owner')).toBe('v7RoleOwner')
    expect(roleLabelKey('commenter')).toBe('v7RoleCommenter')
    expect(roleLabelKey('nope')).toBeNull()
  })

  it('only lets owners grant owner', () => {
    expect(assignableWorkspaceRoles('owner')).toContain('owner')
    expect(assignableWorkspaceRoles('admin')).not.toContain('owner')
    expect(assignableWorkspaceRoles('admin', true)).toContain('owner')
    expect(inviteLinkRoles()).not.toContain('owner')
  })

  it('describes explicit vs inherited memberships with the ancestor name', () => {
    const breadcrumb = [{ _id: 'org', name: 'Org' }, { _id: 'spaceA', name: 'Space A' }]
    expect(describeMembership({ inherited: false }, { breadcrumb })).toEqual({ kind: 'explicit', sourceName: null })
    expect(describeMembership({ inherited: true, sourceWorkspaceId: 'org' }, { breadcrumb }))
      .toEqual({ kind: 'inherited', sourceName: 'Org' })
    expect(describeMembership({ inherited: true, sourceWorkspaceId: 'spaceB' }, { tree }))
      .toEqual({ kind: 'inherited', sourceName: 'Space B' })
    expect(describeMembership({ inherited: true, sourceWorkspaceId: 'gone' }, {}))
      .toEqual({ kind: 'inherited', sourceName: null })
  })
})
