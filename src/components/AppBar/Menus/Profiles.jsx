import { useState, useEffect } from 'react'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import Logout from '@mui/icons-material/Logout'
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import Settings from '@mui/icons-material/Settings'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUserAPI } from '~/redux/user/userSlice'
import { useConfirm } from 'material-ui-confirm'
import { Link } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'
import { setFocusFromUser, useFocusMode } from '~/utils/focusMode'
import { MONO_FONT } from '~/components/Layout/surface'
import soraAvatar from '~/assets/sora.jpg'
import StatusDialog from './StatusDialog'

const STATUS_DOT_COLOR = {
  available: '#22c55e',
  focus: '#a855f7',
  meeting: '#f59e0b',
  ooo: '#64748b'
}

const MODE_LABEL_KEY = {
  available: 'profModeAvailable',
  focus: 'profModeFocus',
  meeting: 'profModeMeeting',
  ooo: 'profModeOoo'
}

function Profiles() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const open = Boolean(anchorEl)

  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const focusActive = useFocusMode()
  const confirmLogout = useConfirm()
  const { t, tPrimary } = useTranslation()

  useEffect(() => {
    setFocusFromUser(currentUser)
  }, [currentUser])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleOpenStatusDialog = () => {
    handleClose()
    setStatusDialogOpen(true)
  }

  const handleLogout = () => {
    handleClose()
    confirmLogout({
      title: tPrimary('logoutConfirmTitle'),
      confirmationText: tPrimary('confirmBtn'),
      cancellationText: tPrimary('cancelBtn')
    }).then(() => {
      dispatch(logoutUserAPI())
    }).catch(() => {})
  }

  const status = currentUser?.status
  const statusMode = status?.mode
  const hasCustomStatus = Boolean(
    status?.text || status?.emoji || (statusMode && statusMode !== 'available')
  )
  const dotColor = statusMode ? STATUS_DOT_COLOR[statusMode] : null
  const tooltipText = focusActive
    ? `${tPrimary('accountSettingsTooltip')} · ${tPrimary('profFocusIndicator')}`
    : tPrimary('accountSettingsTooltip')
  const profilePath = currentUser?.username
    ? `/u/${encodeURIComponent(currentUser.username)}`
    : null

  return (
    <Box>
      <Tooltip title={tooltipText}>
        <IconButton
          onClick={handleClick}
          size='small'
          sx={{ padding: 0 }}
          aria-controls={open ? 'basic-menu-profiles' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge
            overlap='circular'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            invisible={!dotColor}
            badgeContent={(
              <Box
                component='span'
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: dotColor || '#22c55e',
                  border: '2px solid #0f172a',
                  display: 'block'
                }}
              />
            )}
          >
            <Avatar
              sx={{ width: 36, height: 36 }}
              alt={currentUser?.displayName || 'User'}
              src={currentUser?.avatar || soraAvatar}
            />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id='basic-menu-profiles'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-profiles',
          sx: { minWidth: 240 }
        }}
      >
        <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{ width: 38, height: 38 }}
            alt={currentUser?.displayName || 'User'}
            src={currentUser?.avatar || soraAvatar}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant='subtitle2' noWrap sx={{ fontWeight: 800 }}>
              {currentUser?.displayName || tPrimary('profileMenu')}
            </Typography>
            {currentUser?.username && (
              <Typography
                variant='caption'
                color='text.secondary'
                noWrap
                sx={{ display: 'block', fontFamily: MONO_FONT }}
              >
                @{currentUser.username}
              </Typography>
            )}
            {hasCustomStatus && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                <Typography variant='caption' noWrap sx={{ maxWidth: 160 }}>
                  {status?.emoji ? `${status.emoji} ` : ''}{status?.text || ''}
                </Typography>
                {statusMode && MODE_LABEL_KEY[statusMode] && (
                  <Chip
                    size='small'
                    label={tPrimary(MODE_LABEL_KEY[statusMode])}
                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>

        <MenuItem onClick={handleOpenStatusDialog}>
          <ListItemIcon>
            <MoodOutlinedIcon fontSize='small' />
          </ListItemIcon>
          {hasCustomStatus ? t('profEditStatus') : t('profSetStatus')}
        </MenuItem>

        <Divider />

        {profilePath && (
          <MenuItem component={Link} to={profilePath} onClick={handleClose}>
            <ListItemIcon>
              <PersonOutlineRoundedIcon fontSize='small' />
            </ListItemIcon>
            {t('v7NavProfile')}
          </MenuItem>
        )}

        <MenuItem component={Link} to='/my-work' onClick={handleClose}>
          <ListItemIcon>
            <AssignmentIndOutlinedIcon fontSize='small' />
          </ListItemIcon>
          {t('v7NavMyWork')}
        </MenuItem>

        <MenuItem component={Link} to='/inbox' onClick={handleClose}>
          <ListItemIcon>
            <InboxOutlinedIcon fontSize='small' />
          </ListItemIcon>
          {t('v7NavInbox')}
        </MenuItem>

        <Divider />

        <MenuItem component={Link} to='/settings/account' onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize='small' />
          </ListItemIcon>
          {tPrimary('settingsMenu')}
        </MenuItem>

        <MenuItem component={Link} to='/settings/appearance' onClick={handleClose}>
          <ListItemIcon>
            <AutoAwesomeRoundedIcon fontSize='small' />
          </ListItemIcon>
          {tPrimary('tabAppearance')}
        </MenuItem>

        {currentUser?.role === 'admin' && (
          <MenuItem component={Link} to='/admin' onClick={handleClose}>
            <ListItemIcon>
              <AdminPanelSettingsOutlinedIcon fontSize='small' />
            </ListItemIcon>
            {t('v7NavAdmin')}
          </MenuItem>
        )}

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            '&:hover': {
              color: 'warning.dark',
              '& .logout-icon': { color: 'warning.dark' }
            }
          }}
        >
          <ListItemIcon>
            <Logout className='logout-icon' fontSize='small' />
          </ListItemIcon>
          {tPrimary('logoutMenu')}
        </MenuItem>
      </Menu>

      <StatusDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      />
    </Box>
  )
}

export default Profiles
