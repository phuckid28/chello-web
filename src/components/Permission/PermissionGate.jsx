import { cloneElement, isValidElement } from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { useCan } from '~/customHooks/useCan'
import { useTranslation } from '~/customHooks/useTranslation'

/**
 * Permission-aware wrapper (contract v7 §3).
 * - mode='disable' (default): renders the child disabled, wrapped in a tooltip explaining why.
 * - mode='hide': renders nothing when the permission is missing.
 * `resource` defaults to the active board; pass a workspace/board object to check it instead.
 */
function PermissionGate({ permission, resource, mode = 'disable', reason, children }) {
  const allowed = useCan(permission, resource)
  const { tPrimary } = useTranslation()

  if (allowed) return children
  if (mode === 'hide' || !isValidElement(children)) return null

  const message = reason || tPrimary(permission === 'board:comment' ? 'v7NoPermission' : 'v7NoPermissionEdit')
  return (
    <Tooltip title={message} arrow>
      {/* span wrapper keeps the tooltip working on disabled buttons */}
      <Box component="span" sx={{ display: 'inline-flex', cursor: 'not-allowed' }} tabIndex={0} aria-label={message}>
        {cloneElement(children, { disabled: true, 'aria-disabled': true })}
      </Box>
    </Tooltip>
  )
}

export default PermissionGate
