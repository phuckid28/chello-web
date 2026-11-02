import { useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

// FOUNDATION SKELETON — the Profile feature enhances this (status, local time, job title, actions).
// Public API (keep stable): <UserHoverCard user={PublicUser}>{trigger}</UserHoverCard>
// `user` may be a PublicUser or a legacy user object ({ _id, displayName, username, avatar, email }).
function UserHoverCard({ user, children }) {
  const [anchorEl, setAnchorEl] = useState(null)
  if (!user) return children
  const open = Boolean(anchorEl)
  const profilePath = user.username ? `/u/${encodeURIComponent(user.username)}` : null

  return (
    <>
      <Box
        component="span"
        sx={{ display: 'inline-flex' }}
        onMouseEnter={(event) => setAnchorEl(event.currentTarget)}
        onMouseLeave={() => setAnchorEl(null)}
        onFocus={(event) => setAnchorEl(event.currentTarget)}
        onBlur={() => setAnchorEl(null)}
      >
        {children}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus
        sx={{ pointerEvents: 'none' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 1.5, display: 'flex', gap: 1.25, alignItems: 'center', maxWidth: 280 }}>
          <Avatar src={user.avatar || undefined} alt={user.displayName}>{(user.displayName || '?')[0]}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>{user.displayName}</Typography>
            {profilePath && (
              <Typography variant="caption" color="text.secondary" component={RouterLink} to={profilePath}>
                @{user.username}
              </Typography>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default UserHoverCard
