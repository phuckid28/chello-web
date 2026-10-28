import Box from '@mui/material/Box'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import AppsIcon from '@mui/icons-material/Apps'
import Typography from '@mui/material/Typography'
import Workspaces from './Menus/Workspaces'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Profiles from './Menus/Profiles'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { Link } from 'react-router-dom'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'

function AppBar({ boardTheme }) {
  const { themeConfig } = usePersonaTheme(boardTheme)

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      background: (theme) => (
        theme.palette.mode === 'dark' ? themeConfig.appBarBgDark : themeConfig.appBarBgLight
      ),
      borderBottom: `1px solid ${themeConfig.columnBorder}`,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.28)',
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Link to='/boards'>
          <Tooltip title="All Boards • ボード一覧">
            <AppsIcon sx={{ color: 'white', verticalAlign: 'middle' }} />
          </Tooltip>
        </Link>
        <Link to='/' style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SoraBunnyIcon sx={{ fontSize: 28, filter: 'drop-shadow(0 2px 6px rgba(244, 114, 182, 0.45))' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <Typography variant='span' sx={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', letterSpacing: 0.5 }}>
                Chello • 穹
              </Typography>
              <Typography variant='span' sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
                {themeConfig.element} • 春日野 穹
              </Typography>
            </Box>
          </Box>
        </Link>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
          <Workspaces />
          <Recent />
          <Starred />
          <Templates />
        </Box>

        <Link to='/boards' style={{ textDecoration: 'none' }}>
          <Button
            sx={{
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              border: `1px solid ${themeConfig.columnBorder}`,
              backdropFilter: 'blur(6px)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.22)',
                borderColor: themeConfig.accentColor
              }
            }}
            variant='outlined'
            size='small'
            startIcon={<LibraryAddIcon />}
          >
            Boards
          </Button>
        </Link>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          avatar={<Avatar src={themeConfig.mascotImage} alt="Chibi Sora" />}
          icon={<SoraRibbonIcon fontSize="small" />}
          label={themeConfig.name}
          size="small"
          sx={{
            display: { xs: 'none', lg: 'inline-flex' },
            color: 'white',
            fontWeight: 700,
            fontSize: '0.72rem',
            bgcolor: 'rgba(255, 255, 255, 0.14)',
            border: `1px solid ${themeConfig.accentColor}`
          }}
        />

        <AutoCompleteSearchBoard />

        <ModeSelect />

        <Notifications />

        <Profiles />
      </Box>
    </Box>
  )
}

export default AppBar
