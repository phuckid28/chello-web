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
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Switch from '@mui/material/Switch'
import Profiles from './Menus/Profiles'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded'
import MusicOffRoundedIcon from '@mui/icons-material/MusicOffRounded'
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import { Link } from 'react-router-dom'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'
import CommandPalette from '~/components/CommandPalette/CommandPalette'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { SoraBunnyIcon } from '~/components/Icons/SoraBunnyIcon'
import {
  OST_TRACK_CATALOG,
  getCurrentTrackInfo,
  isMusicBoxActive,
  playCustomAudioFile,
  playOstTrack,
  playUiChime,
  stopSoraMusicBox,
  toggleSoraMusicBox
} from '~/utils/soundEffects'
import { toast } from 'react-toastify'

function AppBar({ boardTheme }) {
  const { personaKey, themeConfig } = usePersonaTheme(boardTheme)
  const {
    lang,
    secondaryLang,
    bilingual,
    tPrimary,
    changeLanguage,
    changeSecondaryLanguage,
    toggleBilingual,
    languages
  } = useTranslation()

  const [musicOn, setMusicOn] = useState(isMusicBoxActive)
  const [activeTrack, setActiveTrack] = useState(getCurrentTrackInfo)
  const [ostAnchor, setOstAnchor] = useState(null)
  const [langAnchor, setLangAnchor] = useState(null)

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
    toast.info(next ? `🎵 ${info.title}` : `🔇 ${tPrimary('audioStoppedToast')}`)
  }

  const handleSelectOstTrack = (track) => {
    playOstTrack(track.id)
    setMusicOn(true)
    setActiveTrack(track)
    toast.info(`🎵 ${track.title}`)
  }

  const handleUploadCustomMusic = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    playCustomAudioFile(file)
    toast.success(`🎵 ${file.name}`)
    e.target.value = ''
  }

  const handleOpenCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('chello-open-command-palette'))
  }

  const currentLangObj = languages.find(l => l.code === lang) || languages[0]

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
      paddingX: 2,
      overflowX: 'auto',
      overflowY: 'hidden',
      background: (theme) => (
        theme.palette.mode === 'dark' ? themeConfig.appBarBgDark : themeConfig.appBarBgLight
      ),
      borderBottom: `1px solid ${themeConfig.columnBorder}`,
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.28)',
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <CommandPalette />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
        <Link to='/boards' style={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={tPrimary('allBoards')}>
            <AppsIcon sx={{ color: 'white', verticalAlign: 'middle' }} />
          </Tooltip>
        </Link>
        <Link to='/' style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SoraBunnyIcon sx={{ fontSize: 27, flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(125, 211, 252, 0.45))' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
              <Typography variant='span' sx={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                Chella
              </Typography>
              <Typography variant='span' sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                &quot;C&quot;onfluence - tr&quot;ELL&quot;o - jir&quot;A&quot;
              </Typography>
            </Box>
          </Box>
        </Link>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.25, alignItems: 'center', flexShrink: 0 }}>
          <Workspaces />
          <Recent />
          <Starred />
          <Templates />
        </Box>

        <Link to='/boards' style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Button
            sx={{
              color: 'white',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              fontWeight: 700,
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
            {tPrimary('boardsBtn')}
          </Button>
        </Link>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Tooltip title="Command Palette & Quick Search (Ctrl + K)">
          <Chip
            icon={<TerminalRoundedIcon fontSize="small" sx={{ color: `${themeConfig.accentColor} !important` }} />}
            label={tPrimary('commandBtn')}
            size="small"
            onClick={handleOpenCommandPalette}
            clickable
            sx={{
              display: { xs: 'none', lg: 'inline-flex' },
              flexShrink: 0,
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

        {/* Language & Bilingual Switcher (VI / EN / JA / KO + Song ngữ) */}
        <Tooltip title="Language & Bilingual Switcher (VI • EN • JA • KO)">
          <Chip
            icon={<TranslateRoundedIcon fontSize="small" sx={{ color: 'white !important' }} />}
            label={bilingual ? `${currentLangObj.flag} ${currentLangObj.short}+${secondaryLang.toUpperCase()}` : `${currentLangObj.flag} ${currentLangObj.short}`}
            size="small"
            onClick={(e) => setLangAnchor(e.currentTarget)}
            clickable
            sx={{
              flexShrink: 0,
              color: 'white',
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: bilingual ? 'rgba(52, 211, 153, 0.28)' : 'rgba(255, 255, 255, 0.14)',
              border: `1px solid ${bilingual ? '#34d399' : 'rgba(255, 255, 255, 0.28)'}`
            }}
          />
        </Tooltip>

        {/* Quick Play/Pause + Ambient / OST Playlist Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <Tooltip title={musicOn ? `${activeTrack?.title}` : tPrimary('ostPlaylist')}>
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

          <Tooltip title={tPrimary('ostPopoverTitle')}>
            <Chip
              icon={<QueueMusicRoundedIcon fontSize="small" sx={{ color: 'white !important' }} />}
              label={musicOn ? activeTrack?.title?.split('(')[0]?.trim() : tPrimary('ostPlaylist')}
              size="small"
              onClick={(e) => setOstAnchor(e.currentTarget)}
              clickable
              sx={{
                maxWidth: 145,
                flexShrink: 0,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                bgcolor: musicOn ? 'rgba(244, 114, 182, 0.24)' : 'rgba(255, 255, 255, 0.12)',
                border: `1px solid ${musicOn ? '#f472b6' : 'rgba(255, 255, 255, 0.22)'}`
              }}
            />
          </Tooltip>
        </Box>

        <AutoCompleteSearchBoard />

        <ModeSelect />

        <Notifications />

        <Profiles />
      </Box>

      {/* Multi-Language & Bilingual Popover */}
      <Popover
        open={Boolean(langAnchor)}
        anchorEl={langAnchor}
        onClose={() => setLangAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
            🌐 {tPrimary('languageLabel')} (VI • EN • JA • KO)
          </Typography>
          <Stack spacing={0.75} sx={{ mb: 1.5 }}>
            {languages.map((item) => {
              const active = lang === item.code
              return (
                <Box
                  key={item.code}
                  onClick={() => {
                    playUiChime('sparkle')
                    changeLanguage(item.code)
                  }}
                  sx={{
                    p: 1,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: active ? `1.5px solid ${themeConfig.accentColor}` : '1px solid rgba(148, 163, 184, 0.22)',
                    bgcolor: active ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.flag} {item.nativeName} ({item.short})
                  </Typography>
                  {active && <Chip label={tPrimary('primaryChip')} size="small" color="info" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />}
                </Box>
              )
            })}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {tPrimary('bilingualToggle')} (Bilingual Mode)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {bilingual ? tPrimary('bilingualOn') : tPrimary('bilingualOff')}
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={bilingual}
              onChange={() => {
                playUiChime('sparkle')
                toggleBilingual()
              }}
            />
          </Box>

          {bilingual && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                {tPrimary('secondaryLangLabel')}
              </Typography>
              <Stack direction="row" spacing={0.75}>
                {languages.filter(l => l.code !== lang).map(l => (
                  <Chip
                    key={l.code}
                    label={`${l.flag} ${l.short}`}
                    size="small"
                    color={secondaryLang === l.code ? 'secondary' : 'default'}
                    onClick={() => changeSecondaryLanguage(l.code)}
                    clickable
                    sx={{ fontWeight: 700 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Popover>

      {/* Soundscape & OST Playlist Popover */}
      <Popover
        open={Boolean(ostAnchor)}
        anchorEl={ostAnchor}
        onClose={() => setOstAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box sx={{ p: 2.25, width: 390, maxWidth: '94vw', maxHeight: 480, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {tPrimary('ostPopoverTitle')}
            </Typography>
            {musicOn && (
              <Button size="small" color="error" onClick={() => stopSoraMusicBox()} sx={{ textTransform: 'none', fontWeight: 700 }}>
                {tPrimary('stopMusic')}
              </Button>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {tPrimary('ostPopoverSub')}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isSelected ? '🔊 ' : '🎵 '}{track.title}
                    </Typography>
                    <Chip
                      label={track.character.toUpperCase()}
                      size="small"
                      sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, flexShrink: 0 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
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
            {tPrimary('uploadAudioBtn')}
            <input type="file" hidden accept="audio/*" onChange={handleUploadCustomMusic} />
          </Button>
        </Box>
      </Popover>
    </Box>
  )
}

export default AppBar
