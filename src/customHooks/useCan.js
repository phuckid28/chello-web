import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { can } from '~/utils/permissions'

/**
 * Permission-aware UI helper (contract v7 §3).
 * `useCan('board:edit')` checks the active board (myRole / permissions from GET /v1/boards/:id).
 * Pass an explicit resource (workspace details, board summary…) as the second argument to check it instead.
 */
export const useCan = (permission, resource) => {
  const currentUser = useSelector(selectCurrentUser)
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const target = resource === undefined ? activeBoard : resource
  return can(target, permission, currentUser)
}

// Returns a checker bound to a resource, for components that test several permissions
export const usePermissionChecker = (resource) => {
  const currentUser = useSelector(selectCurrentUser)
  const activeBoard = useSelector(selectCurrentActiveBoard)
  const target = resource === undefined ? activeBoard : resource
  return useCallback((permission) => can(target, permission, currentUser), [target, currentUser])
}
