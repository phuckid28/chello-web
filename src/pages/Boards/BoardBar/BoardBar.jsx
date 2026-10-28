import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Tooltip } from '@mui/material'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import { updateBoardDetailsAPI } from '~/apis'
import { useDispatch } from 'react-redux'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { ELEMENTAL_LABELS, PRIMARY_THEME_KEYS, soraChibi } from '~/utils/animeTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { toast } from 'react-toastify'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  paddingX: '6px',
  borderRadius: '8px',
  fontWeight: 600,
  backdropFilter: 'blur(6px)',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.22)'
  }
}

function BoardBar({ board, cardFilterText = '', setCardFilterText }) {
  const dispatch = useDispatch()
  const { personaKey, themeConfig, changePersona } = usePersonaTheme(board?.theme)

  // Pomodoro Focus Timer state (25 mins default)
  const [timerAnchor, setTimerAnchor] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)

  // Filter Popover state
  const [filterAnchor, setFilterAnchor] = useState(null)

  useEffect(() => {
    if (!isRunning) return undefined
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          toast.success(`${themeConfig.characterName}: Focus session complete! Rest well with Usagi plush!`)
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, themeConfig.characterName])

  const formatTimer = (totalSec) => {
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
    const s = String(totalSec % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const onUpdateBoardTitle = (newTitle) => {
    updateBoardDetailsAPI(board._id, { title: newTitle }).then(() => {
      dispatch(updateCurrentActiveBoard({ ...board, title: newTitle }))
    })
  }

  const handleToggleStarBoard = () => {
    const nextStarred = !board?.isStarred
    dispatch(updateCurrentActiveBoard({ ...board, isStarred: nextStarred }))
    updateBoardDetailsAPI(board._id, { isStarred: nextStarred })
  }

  const handleToggleBoardType = () => {
    const nextType = board?.type === 'public' ? 'private' : 'public'
    dispatch(updateCurrentActiveBoard({ ...board, type: nextType }))
    updateBoardDetailsAPI(board._id, { type: nextType }).then(() => {
      toast.info(`Board visibility switched to ${capitalizeFirstLetter(nextType)}`)
    })
  }

  const handleCycleSoraTheme = () => {
    const currentIndex = PRIMARY_THEME_KEYS.indexOf(personaKey)
    const nextTheme = PRIMARY_THEME_KEYS[(currentIndex + 1) % PRIMARY_THEME_KEYS.length]
    changePersona(nextTheme)
    dispatch(updateCurrentActiveBoard({ ...board, theme: nextTheme }))
    updateBoardDetailsAPI(board._id, { theme: nextTheme })
  }

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
      background: (theme) => (
        theme.palette.mode === 'dark' ? themeConfig.boardBarBgDark : themeConfig.boardBarBgLight
      ),
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${themeConfig.columnBorder}`,
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title={board?.description || 'Click to edit board title'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pl: 0.5 }}>
            <SoraRibbonIcon sx={{ fontSize: '22px' }} />
            <Box sx={{
              minWidth: '120px',
              maxWidth: '250px',
              '& input': { color: 'white !important' },
              '& .MuiOutlinedInput-root.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)'
              }
            }}>
              <ToggleFocusInput
                value={board?.title || ''}
                onChangedValue={onUpdateBoardTitle}
              />
            </Box>
          </Box>
        </Tooltip>

        <Tooltip title={board?.isStarred ? 'Unstar this board' : 'Star this board • お気に入り'}>
          <IconButton
            size="small"
            onClick={handleToggleStarBoard}
            sx={{
              color: board?.isStarred ? '#fbbf24' : 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
            }}
          >
            {board?.isStarred ? <StarRoundedIcon fontSize="small" /> : <StarBorderRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Click to toggle Public / Private">
          <Chip
            sx={MENU_STYLES}
            icon={<VpnLockIcon />}
            label={capitalizeFirstLetter(board?.type)}
            onClick={handleToggleBoardType}
            clickable
          />
        </Tooltip>

        <Tooltip title="Switch Sora Kasugano Mood (Distant Sky / Black Ribbon / Usagi Plush)">
          <Chip
            sx={{
              ...MENU_STYLES,
              borderColor: themeConfig.accentColor
            }}
            icon={<SoraRibbonIcon />}
            label={`${themeConfig.element}: ${themeConfig.name.split('•')[0].trim()}`}
            onClick={handleCycleSoraTheme}
            clickable
          />
        </Tooltip>

        <Tooltip title="Sora & Usagi Focus Timer (Pomodoro)">
          <Chip
            sx={{
              ...MENU_STYLES,
              bgcolor: isRunning ? 'rgba(244, 114, 182, 0.35)' : MENU_STYLES.bgcolor
            }}
            icon={<SoraBunnyIcon />}
            label={isRunning ? `Focus ${formatTimer(secondsLeft)}` : 'Usagi Focus • 集中'}
            onClick={(e) => setTimerAnchor(e.currentTarget)}
            clickable
          />
        </Tooltip>

        <Tooltip title="Filter cards by title or Sora tag">
          <Chip
            sx={{
              ...MENU_STYLES,
              bgcolor: cardFilterText ? 'rgba(125, 211, 252, 0.35)' : MENU_STYLES.bgcolor
            }}
            icon={<FilterAltIcon />}
            label={cardFilterText ? `Filter: ${cardFilterText}` : 'Filter'}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            onDelete={cardFilterText ? () => setCardFilterText('') : undefined}
            clickable
          />
        </Tooltip>
      </Box>

      {/* Pomodoro Popover */}
      <Popover
        open={Boolean(timerAnchor)}
        anchorEl={timerAnchor}
        onClose={() => setTimerAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2.5, width: 325, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={soraChibi} alt="Chibi Sora" sx={{ width: 46, height: 46, border: '2px solid #f472b6' }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                🐰 {themeConfig.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Usagi Plush Focus Companion
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            {themeConfig.quote}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center', my: 0.5, letterSpacing: 2 }}>
            {formatTimer(secondsLeft)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="small"
              color={isRunning ? 'warning' : 'primary'}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Pause' : 'Start Focus'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setIsRunning(false)
                setSecondsLeft(25 * 60)
              }}
            >
              25m Focus
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setIsRunning(false)
                setSecondsLeft(5 * 60)
              }}
            >
              5m Rest
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Filter Cards Popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 310, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            🔍 Filter Tasks & Sora Tags
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Type card title or tag..."
            value={cardFilterText}
            onChange={(e) => setCardFilterText(e.target.value)}
            autoFocus
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {ELEMENTAL_LABELS.map(lbl => (
              <Chip
                key={lbl.id}
                label={lbl.title}
                size="small"
                onClick={() => setCardFilterText(cardFilterText === lbl.id ? '' : lbl.id)}
                sx={{
                  bgcolor: lbl.color,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '11px',
                  opacity: cardFilterText && cardFilterText !== lbl.id ? 0.55 : 1
                }}
              />
            ))}
          </Box>
          {cardFilterText && (
            <Button size="small" onClick={() => setCardFilterText('')}>
              Clear Filter
            </Button>
          )}
        </Box>
      </Popover>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <InviteBoardUser boardId={board._id} />
        <BoardUserGroup boardUsers={board?.FE_allUsers} />
      </Box>
    </Box>
  )
}

export default BoardBar
