import { useState, useEffect } from 'react'
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
import IconButton from '@mui/material/IconButton'
import Profiles from './Menus/Profiles'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded'
import MusicOffRoundedIcon from '@mui/icons-material/MusicOffRounded'
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded'
import { Link } from 'react-router-dom'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'
import CommandPalette from '~/components/CommandPalette/CommandPalette'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { toggleSoraMusicBox, isMusicBoxActive } from '~/utils/soundEffects'
import { toast } from 'react-toastify'

function AppBar({ boardTheme }) {
  const { themeConfig } = usePersonaTheme(boardTheme)
  const [musicOn, setMusicOn] = useState(isMusicBoxActive)

  useEffect(() => {
    const handleMusicChange = (e) => setMusicOn(Boolean(e.detail))
    window.addEventListener('chello-musicbox-change', handleMusicChange)
    return () => window.removeEventListener('chello-musicbox-change', handleMusicChange)
  }, [])

  const handleToggleMusic = () => {
    const next = toggleSoraMusicBox()
    setMusicOn(next)
    toast.info(next ? '🎵 Playing Sora’s Music Box (春日野 穹のオルゴール)' : '🔇 Music Box paused')
  }

  const handleOpenCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('chello-open-command-palette'))
  }

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
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.28)',
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <CommandPalette />

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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Tooltip title="Open Okukozome Command Center (Ctrl + K)">
          <Chip
            icon={<TerminalRoundedIcon fontSize="small" sx={{ color: `${themeConfig.accentColor} !important` }} />}
            label="⌘K Command"
            size="small"
            onClick={handleOpenCommandPalette}
            clickable
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              color: 'white',
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: 'rgba(15, 23, 42, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                borderColor: themeConfig.accentColor
              }
            }}
          />
        </Tooltip>

        <Tooltip title={musicOn ? 'Pause Sora’s Music Box (オルゴール)' : 'Play Sora’s Music Box (春日野 穹のオルゴール)'}>
          <IconButton
            size="small"
            onClick={handleToggleMusic}
            sx={{
              color: musicOn ? '#f472b6' : 'white',
              bgcolor: musicOn ? 'rgba(244, 114, 182, 0.22)' : 'rgba(255, 255, 255, 0.1)',
              border: musicOn ? '1px solid #f472b6' : '1px solid rgba(255, 255, 255, 0.2)',
              animation: musicOn ? 'chelloPulseHalo 2.4s infinite' : 'none',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.22)' }
            }}
          >
            {musicOn ? <MusicNoteRoundedIcon fontSize="small" /> : <MusicOffRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Chip
          avatar={<Avatar src={themeConfig.mascotImage} alt="Chibi Sora" />}
          icon={<SoraRibbonIcon fontSize="small" />}
          label={themeConfig.name}
          size="small"
          sx={{
            display: { xs: 'none', xl: 'inline-flex' },
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
