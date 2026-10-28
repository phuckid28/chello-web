import { useState, useEffect, useMemo } from 'react'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Chip from '@mui/material/Chip'
import SearchIcon from '@mui/icons-material/Search'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useColorScheme } from '@mui/material/styles'
import { selectCurrentActiveBoard, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { PRIMARY_THEMES_LIST } from '~/utils/animeTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { playUiChime, toggleSoraMusicBox, isMusicBoxActive } from '~/utils/soundEffects'
import { updateBoardDetailsAPI } from '~/apis'
import { toast } from 'react-toastify'

function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const { mode, setMode } = useColorScheme()
  const { themeConfig, changePersona } = usePersonaTheme(board?.theme)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => {
          const next = !prev
          if (next) {
            setSearch('')
            setSelectedIndex(0)
            playUiChime('sparkle')
          }
          return next
        })
      }
    }

    const handleCustomOpen = () => {
      setSearch('')
      setSelectedIndex(0)
      setOpen(true)
      playUiChime('sparkle')
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('chello-open-command-palette', handleCustomOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('chello-open-command-palette', handleCustomOpen)
    }
  }, [])

  const commands = useMemo(() => {
    const list = []

    // 1. Cards in current active board
    if (board?.columns?.length) {
      board.columns.forEach((col) => {
        (col.cards || []).forEach((card) => {
          if (!card.FE_PlaceholderCard) {
            list.push({
              id: `card-${card._id}`,
              category: 'Active Board Cards • カード検索',
              title: card.title,
              subtitle: `Column: ${col.title}`,
              badge: 'Open Card',
              icon: <SoraRibbonIcon fontSize="small" />,
              action: () => {
                dispatch(updateCurrentActiveCard(card))
                dispatch(showModalActiveCard())
                playUiChime('sparkle')
              }
            })
          }
        })
      })
    }

    // 2. Sora Kasugano Theme Moods
    PRIMARY_THEMES_LIST.forEach((t) => {
      list.push({
        id: `theme-${t.id}`,
        category: 'Sora Kasugano Aesthetic • テーマ切替',
        title: `Switch to ${t.name}`,
        subtitle: t.jpTitle,
        badge: t.element,
        icon: <SoraBunnyIcon fontSize="small" />,
        action: () => {
          changePersona(t.id)
          if (board?._id) {
            dispatch(updateCurrentActiveBoard({ ...board, theme: t.id }))
            updateBoardDetailsAPI(board._id, { theme: t.id })
          }
          playUiChime('theme')
          toast.info(`Switched aesthetic to ${t.name}`)
        }
      })
    })

    // 3. Ambient Music Box & Color Mode
    list.push({
      id: 'toggle-music-box',
      category: 'Okukozome Atmosphere • 環境演出',
      title: isMusicBoxActive()
        ? 'Pause Sora’s Music Box (オルゴール停止)'
        : 'Play Sora’s Music Box Melody (春日野 穹のオルゴール)',
      subtitle: 'Gentle wind-up celesta melody inspired by Yosuga no Sora OST',
      badge: 'Audio',
      icon: <MusicNoteRoundedIcon fontSize="small" sx={{ color: '#f472b6' }} />,
      action: () => {
        const playing = toggleSoraMusicBox()
        toast.info(playing ? '🎵 Playing Sora’s Music Box (Kioku Melody)...' : '🔇 Paused Music Box')
      }
    })

    list.push({
      id: 'toggle-color-mode',
      category: 'Okukozome Atmosphere • 環境演出',
      title: `Switch Color Mode (Current: ${mode})`,
      subtitle: 'Toggle between Dark Moonlit mode and Light Morning Sky mode',
      badge: mode === 'dark' ? 'Light Mode' : 'Dark Mode',
      icon: <DarkModeOutlinedIcon fontSize="small" sx={{ color: '#7dd3fc' }} />,
      action: () => {
        setMode(mode === 'dark' ? 'light' : 'dark')
        playUiChime('sparkle')
      }
    })

    // 4. Navigation
    list.push(
      {
        id: 'nav-boards',
        category: 'Navigation • ナビゲーション',
        title: 'Go to All Boards Dashboard',
        subtitle: 'Browse all workspaces, starred boards & 1-click Sora templates',
        badge: '/boards',
        icon: <SpaceDashboardIcon fontSize="small" color="primary" />,
        action: () => navigate('/boards')
      },
      {
        id: 'nav-account',
        category: 'Navigation • ナビゲーション',
        title: 'Account & Profile Settings',
        subtitle: 'Update display name and avatar',
        badge: '/settings/account',
        icon: <ManageAccountsOutlinedIcon fontSize="small" color="primary" />,
        action: () => navigate('/settings/account')
      },
      {
        id: 'nav-security',
        category: 'Navigation • ナビゲーション',
        title: 'Security & Password Settings',
        subtitle: 'Manage password and account security',
        badge: '/settings/security',
        icon: <LockOutlinedIcon fontSize="small" color="primary" />,
        action: () => navigate('/settings/security')
      }
    )

    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
    )
  }, [board, search, mode, setMode, changePersona, dispatch, navigate])

  const handleClose = () => setOpen(false)

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (commands.length ? (prev + 1) % commands.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (commands.length ? (prev - 1 + commands.length) % commands.length : 0))
    } else if (e.key === 'Enter' && commands[selectedIndex]) {
      e.preventDefault()
      const cmd = commands[selectedIndex]
      handleClose()
      cmd.action()
    }
  }

  return (
    <Modal open={open} onClose={handleClose} disableAutoFocus={false}>
      <Box
        sx={{
          position: 'absolute',
          top: '14%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 640,
          maxWidth: '94vw',
          maxHeight: '72vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '18px',
          overflow: 'hidden',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)'),
          backdropFilter: 'blur(22px) saturate(180%)',
          border: `1px solid ${themeConfig.accentColor}`,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          outline: 0,
          animation: 'chelloFadeSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
          <TextField
            fullWidth
            autoFocus
            placeholder="Type a command, search cards, or switch Sora mood... (↑↓ to navigate, Enter to run)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleInputKeyDown}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: themeConfig.accentColor, mr: 0.5 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Chip
                    label="ESC"
                    size="small"
                    onClick={handleClose}
                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                  />
                </InputAdornment>
              ),
              sx: { fontSize: '0.98rem', fontWeight: 600 }
            }}
          />
        </Box>

        <Box sx={{ overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {commands.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <SoraBunnyIcon sx={{ fontSize: 38, mb: 1, opacity: 0.7 }} />
              <Typography variant="body2" color="text.secondary">
                No matching commands or cards found in Okukozome.
              </Typography>
            </Box>
          )}

          {commands.map((cmd, idx) => {
            const isSelected = idx === selectedIndex
            const showCategoryHeader = idx === 0 || commands[idx - 1].category !== cmd.category
            return (
              <Box key={cmd.id}>
                {showCategoryHeader && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.5,
                      pt: idx === 0 ? 0.5 : 1.5,
                      pb: 0.5,
                      display: 'block',
                      fontWeight: 800,
                      letterSpacing: 0.6,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      fontSize: '0.68rem'
                    }}
                  >
                    {cmd.category}
                  </Typography>
                )}
                <Box
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    handleClose()
                    cmd.action()
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.1,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    bgcolor: isSelected
                      ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(125, 211, 252, 0.16)' : 'rgba(2, 132, 199, 0.10)')
                      : 'transparent',
                    borderLeft: isSelected ? `3px solid ${themeConfig.accentColor}` : '3px solid transparent'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    {cmd.icon}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {cmd.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                        {cmd.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={cmd.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: isSelected ? themeConfig.accentColor : 'rgba(148, 163, 184, 0.18)',
                      color: isSelected ? '#0f172a' : 'text.secondary'
                    }}
                  />
                </Box>
              </Box>
            )
          })}
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: '1px solid rgba(148, 163, 184, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(9, 13, 22, 0.55)' : 'rgba(241, 245, 249, 0.7)')
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <SoraBunnyIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Okukozome Command Center • 春日野 穹
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Shortcut: <b>Ctrl + K</b>
          </Typography>
        </Box>
      </Box>
    </Modal>
  )
}

export default CommandPalette
