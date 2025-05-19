import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Tooltip } from '@mui/material'
import Button from '@mui/material/Button'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar() {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      borderBottom: '1px solid white',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />}
          label="Phuckid28"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label="Public/Private workspaces"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add To Google Drive"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterAltIcon />}
          label="Filter"
          clickable
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant='outlined'
          startIcon={<PersonAddAltIcon/>}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' }
          }}
        >
          Invite
        </Button>
        <AvatarGroup
          max={7}
          sx={{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: '34px',
              height: '34px',
              fontSize: 16,
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&:first-of-type': { bgcolor: '#a4b0be' }
            }
          }}
        >
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip><Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
          <Tooltip title='Phuckid28'>
            <Avatar
              alt="Phuckid28"
              src='src\assets\sora.jpg'
            />
          </Tooltip>
        </AvatarGroup>
      </Box>

    </Box>
  )
}

export default BoardBar
