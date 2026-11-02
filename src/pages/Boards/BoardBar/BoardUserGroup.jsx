import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { getPresenceViewers, subscribePresence } from '~/apis'
import UserHoverCard from '~/components/User/UserHoverCard'
import { useTranslation } from '~/customHooks/useTranslation'
import soraAvatar from '~/assets/sora.jpg'

function BoardUserGroup({ boardId, boardUsers = [], limit = 6 }) {
  const { t, formatMessage } = useTranslation()
  const [anchorPopoverElement, setAnchorPopoverElement] = useState(null)
  const [viewers, setViewers] = useState(() => (boardId ? getPresenceViewers(boardId) : []))
  const isOpenPopover = Boolean(anchorPopoverElement)
  const popoverId = isOpenPopover ? 'board-all-users-popover' : undefined

  useEffect(() => {
    if (!boardId) return undefined
    setViewers(getPresenceViewers(boardId))
    const unsubscribe = subscribePresence(boardId, (nextViewers) => {
      setViewers(Array.isArray(nextViewers) ? nextViewers : [])
    })
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [boardId])

  const handleTogglePopover = (event) => {
    if (!anchorPopoverElement) setAnchorPopoverElement(event.currentTarget)
    else setAnchorPopoverElement(null)
  }

  const viewerMap = new Map(
    (viewers || []).map(v => [String(v.userId || v._id || ''), v])
  )

  const renderUserAvatar = (user, index) => {
    const uid = String(user?._id || '')
    const viewer = viewerMap.get(uid)
    const isOnline = Boolean(viewer)
    const tooltipLabel = viewer?.activeCardTitle
      ? formatMessage('collabPresenceEditing', {
        name: user?.displayName || user?.username || '',
        card: viewer.activeCardTitle
      })
      : `${user?.displayName || user?.username || ''}${isOnline ? ` • ${t('collabPresenceLive')}` : ''}`

    return (
      <UserHoverCard user={user} key={user?._id || index}>
        <Tooltip title={tooltipLabel}>
          <Badge
            overlap="circular"
            variant="dot"
            invisible={!isOnline}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#22c55e',
                color: '#22c55e',
                boxShadow: '0 0 0 2px #0f172a'
              }
            }}
          >
            <Avatar
              sx={{ width: 34, height: 34, cursor: 'pointer' }}
              alt={user?.displayName}
              src={user?.avatar || soraAvatar}
            />
          </Badge>
        </Tooltip>
      </UserHoverCard>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {viewers.length > 0 && (
        <Tooltip title={formatMessage('collabPresenceViewing', { count: viewers.length })}>
          <Typography
            variant="caption"
            sx={{
              px: 0.75,
              py: 0.25,
              mr: 0.5,
              borderRadius: 1,
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#86efac',
              bgcolor: 'rgba(34, 197, 94, 0.16)',
              border: '1px solid rgba(34, 197, 94, 0.35)'
            }}
          >
            ● {viewers.length}
          </Typography>
        </Tooltip>
      )}

      {boardUsers.slice(0, limit).map((user, index) => renderUserAvatar(user, index))}

      {boardUsers.length > limit && (
        <Tooltip title="Show more">
          <Box
            aria-describedby={popoverId}
            onClick={handleTogglePopover}
            sx={{
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '50%',
              color: 'white',
              backgroundColor: '#a4b0be'
            }}
          >
            +{boardUsers.length - limit}
          </Box>
        </Tooltip>
      )}

      <Popover
        id={popoverId}
        open={isOpenPopover}
        anchorEl={anchorPopoverElement}
        onClose={handleTogglePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: '260px', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {boardUsers.map((user, index) => renderUserAvatar(user, index))}
        </Box>
      </Popover>
    </Box>
  )
}

export default BoardUserGroup
