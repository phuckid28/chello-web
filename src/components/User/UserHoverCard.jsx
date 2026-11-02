import { useState, useRef, useEffect } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { Link as RouterLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { useTranslation } from '~/customHooks/useTranslation'
import { getLocalTimeInfo, LOCALE_BY_LANG } from '~/utils/workingHours'
import { MONO_FONT } from '~/components/Layout/surface'

const MODE_LABEL_KEY = {
  available: 'profModeAvailable',
  focus: 'profModeFocus',
  meeting: 'profModeMeeting',
  ooo: 'profModeOoo'
}

const MODE_DOT_COLOR = {
  available: '#22c55e',
  focus: '#a855f7',
  meeting: '#f59e0b',
  ooo: '#64748b'
}

const CLOSE_DELAY_MS = 180

// Public API (stable): <UserHoverCard user={PublicUser}>{trigger}</UserHoverCard>
function UserHoverCard({ user, children }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const closeTimerRef = useRef(null)
  const currentUser = useSelector(selectCurrentUser)
  const { t, tPrimary, formatMessage, lang } = useTranslation()

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  if (!user) return children

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const handleOpen = (event) => {
    clearCloseTimer()
    setAnchorEl(event.currentTarget)
  }

  const handleScheduleClose = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setAnchorEl(null)
    }, CLOSE_DELAY_MS)
  }

  const handleImmediateClose = () => {
    clearCloseTimer()
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const profilePath = user.username ? `/u/${encodeURIComponent(user.username)}` : null
  const roleLine = [user.jobTitle, user.department].filter(Boolean).join(' · ')
  const status = user.status
  const hasStatus = Boolean(
    status?.text || status?.emoji || (status?.mode && MODE_LABEL_KEY[status.mode])
  )
  const timeInfo = user.timezone
    ? getLocalTimeInfo({
      timeZone: user.timezone,
      workingHours: user.workingHours,
      viewerTimeZone: currentUser?.timezone,
      locale: LOCALE_BY_LANG[lang] || 'en-US'
    })
    : null

  return (
    <>
      <Box
        component='span'
        sx={{ display: 'inline-flex' }}
        onMouseEnter={handleOpen}
        onMouseLeave={handleScheduleClose}
        onFocus={handleOpen}
        onBlur={handleScheduleClose}
      >
        {children}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleImmediateClose}
        disableRestoreFocus
        sx={{ pointerEvents: 'none' }}
        PaperProps={{
          onMouseEnter: clearCloseTimer,
          onMouseLeave: handleScheduleClose,
          sx: {
            pointerEvents: 'auto',
            p: 2,
            width: 288,
            borderRadius: 'var(--chella-radius-card, 14px)',
            border: (theme) => `1px solid ${theme.palette.divider}`
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Avatar
            src={user.avatar || undefined}
            alt={user.displayName}
            sx={{ width: 44, height: 44, fontWeight: 800 }}
          >
            {(user.displayName || user.username || '?')[0]}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant='subtitle2' noWrap sx={{ fontWeight: 800 }}>
              {user.displayName || user.username}
            </Typography>
            {profilePath && (
              <Typography
                variant='caption'
                color='text.secondary'
                component={RouterLink}
                to={profilePath}
                onClick={handleImmediateClose}
                sx={{
                  fontFamily: MONO_FONT,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                @{user.username}
              </Typography>
            )}
            {roleLine && (
              <Typography variant='caption' color='text.secondary' noWrap sx={{ display: 'block', mt: 0.25 }}>
                {roleLine}
              </Typography>
            )}
          </Box>
        </Box>

        {hasStatus && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
            {(status?.emoji || status?.text) && (
              <Chip
                size='small'
                variant='outlined'
                label={`${status.emoji ? `${status.emoji} ` : ''}${status.text || ''}`.trim()}
                sx={{ maxWidth: '100%', fontWeight: 600 }}
              />
            )}
            {status?.mode && MODE_LABEL_KEY[status.mode] && (
              <Chip
                size='small'
                label={tPrimary(MODE_LABEL_KEY[status.mode])}
                icon={(
                  <Box
                    component='span'
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: MODE_DOT_COLOR[status.mode] || '#22c55e',
                      display: 'inline-block',
                      ml: 1
                    }}
                  />
                )}
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        )}

        {timeInfo && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 1.25 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant='caption' color='text.secondary' sx={{ fontFamily: MONO_FONT }}>
              {formatMessage('profLocalTime', { time: timeInfo.timeString })}
            </Typography>
            {timeInfo.hasWorkingHours && (
              <Chip
                size='small'
                color={timeInfo.isWorking ? 'success' : 'default'}
                variant='outlined'
                label={tPrimary(timeInfo.isWorking ? 'profWorkingNow' : 'profOutsideHours')}
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
            )}
          </Box>
        )}

        {profilePath && (
          <Box sx={{ mt: 1.5, pt: 1.25, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Button
              component={RouterLink}
              to={profilePath}
              onClick={handleImmediateClose}
              size='small'
              fullWidth
              endIcon={<ArrowForwardRoundedIcon fontSize='small' />}
              sx={{ textTransform: 'none', fontWeight: 700, justifyContent: 'space-between' }}
            >
              {t('profViewProfile')}
            </Button>
          </Box>
        )}
      </Popover>
    </>
  )
}

export default UserHoverCard
