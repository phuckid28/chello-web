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
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Profiles from './Menus/Profiles'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded'
import MusicOffRoundedIcon from '@mui/icons-material/MusicOffRounded'
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded'
import { Link } from 'react-router-dom'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'
import CommandPalette from '~/components/CommandPalette/CommandPalette'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import {
  OST_TRACK_CATALOG,
  getCurrentTrackInfo,
  isMusicBoxActive,
  playCustomAudioFile,
  playOstTrack,
  stopSoraMusicBox,
  toggleSoraMusicBox
} from '~/utils/soundEffects'
import { toast } from 'react-toastify'

function AppBar({ boardTheme }) {
  const { personaKey, themeConfig } = usePersonaTheme(boardTheme)
  const [musicOn, setMusicOn] = useState(isMusicBoxActive)
  const [activeTrack, setActiveTrack] = useState(getCurrentTrackInfo)
  const [ostAnchor, setOstAnchor] = useState(null)

  useEffect(() => {
    const handleMusicChange = (e) => {
      if (typeof e.detail === 'object' && e.detail !== null) {
        setMusicOn(Boolean(e.detail.isPlaying))
        if (e.detail.track) setActiveTrack(e.detail.track)
      } else {
        setMusicOn(Boolean(e.detail))
        setActiveTrack(getCurrentTrackInfo())
      }
    }
    window.addEventListener('chello-musicbox-change', handleMusicChange)
    return () => window.removeEventListener('chello-musicbox-change', handleMusicChange)
  }, [])

  const handleToggleMusicQuick = () => {
    const next = toggleSoraMusicBox(personaKey)
    const info = getCurrentTrackInfo()
    setMusicOn(next)
    setActiveTrack(info)
    toast.info(next ? `🎵 Đang phát: ${info.title}` : '🔇 Đã tạm dừng nhạc nền')
  }

  const handleSelectOstTrack = (track) => {
    playOstTrack(track.id)
    setMusicOn(true)
    setActiveTrack(track)
    toast.info(`🎵 Đang phát: ${track.title}`)
  }

  const handleUploadCustomMusic = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    playCustomAudioFile(file)
    toast.success(`🎵 Đang phát file nhạc cá nhân: ${file.name}`)
    e.target.value = ''
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
          <Tooltip title="Danh sách Bảng (All Boards)">
            <AppsIcon sx={{ color: 'white', verticalAlign: 'middle' }} />
          </Tooltip>
        </Link>
        <Link to='/' style={{ textDecoration: 'none' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SoraBunnyIcon sx={{ fontSize: 28, filter: 'drop-shadow(0 2px 6px rgba(244, 114, 182, 0.45))' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <Typography variant='span' sx={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', letterSpacing: 0.5 }}>
                Chello • BA & Anime
              </Typography>
              <Typography variant='span' sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
                {themeConfig.element} • {themeConfig.name.split('•')[0].trim()}
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
        <Tooltip title="Mở Trung tâm Điều khiển & Tìm kiếm nhanh (Ctrl + K)">
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

        {/* Quick Play/Pause + OST Playlist Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={musicOn ? `Đang phát: ${activeTrack?.title} (Nhấn để dừng)` : 'Phát nhạc nền OST nhân vật'}>
            <IconButton
              size="small"
              onClick={handleToggleMusicQuick}
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

          <Tooltip title="Danh sách Nhạc nền OST (Sora: Toui Sora e, Inori, Tomadoi no Naka • Furina: Sinner's Finale • Nahida: Sumeru OST)">
            <Chip
              icon={<QueueMusicRoundedIcon fontSize="small" sx={{ color: 'white !important' }} />}
              label={musicOn ? activeTrack?.title?.split('(')[0]?.trim() : 'OST Playlist'}
              size="small"
              onClick={(e) => setOstAnchor(e.currentTarget)}
              clickable
              sx={{
                maxWidth: 165,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: musicOn ? 'rgba(244, 114, 182, 0.24)' : 'rgba(255, 255, 255, 0.12)',
                border: `1px solid ${musicOn ? '#f472b6' : 'rgba(255, 255, 255, 0.22)'}`
              }}
            />
          </Tooltip>
        </Box>

        <Chip
          avatar={<Avatar src={themeConfig.mascotImage} alt={themeConfig.name} />}
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

      {/* Multi-Character OST Playlist Popover */}
      <Popover
        open={Boolean(ostAnchor)}
        anchorEl={ostAnchor}
        onClose={() => setOstAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box sx={{ p: 2.25, width: 390, maxHeight: 480, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              🎼 Anime OST Soundtracks (Sora • Furina • Nahida)
            </Typography>
            {musicOn && (
              <Button size="small" color="error" onClick={() => stopSoraMusicBox()} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Tắt nhạc
              </Button>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Phát trực tiếp bản nhạc OST gốc hoặc chọn file nhạc từ máy tính của bạn:
          </Typography>

          <Stack spacing={0.85}>
            {OST_TRACK_CATALOG.map((track) => {
              const isSelected = musicOn && activeTrack?.id === track.id
              return (
                <Box
                  key={track.id}
                  onClick={() => handleSelectOstTrack(track)}
                  sx={{
                    p: 1.1,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: isSelected ? `1.5px solid ${themeConfig.accentColor}` : '1px solid rgba(148, 163, 184, 0.22)',
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {isSelected ? '🔊 ' : '🎵 '}{track.title}
                    </Typography>
                    <Chip
                      label={track.character.toUpperCase()}
                      size="small"
                      sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {track.subtitle}
                  </Typography>
                </Box>
              )
            })}
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Button
            component="label"
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<UploadFileRoundedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
          >
            Chọn file nhạc (.MP3 / .WAV / .OGG) từ máy tính
            <input type="file" hidden accept="audio/*" onChange={handleUploadCustomMusic} />
          </Button>
        </Box>
      </Popover>
    </Box>
  )
}

export default AppBar
