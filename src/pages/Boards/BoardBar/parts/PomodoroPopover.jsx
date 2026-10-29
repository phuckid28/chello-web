import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { formatTimer } from '~/customHooks/usePomodoro'
import { playUiChime } from '~/utils/soundEffects'
import { POMODORO_BREAK_SECONDS, POMODORO_FOCUS_SECONDS } from './boardBarStyles'

const RING_SIZE = 150

function PomodoroPopover({ anchorEl, onClose, themeConfig, pomodoro }) {
  const { secondsLeft, durationSeconds, isRunning, setIsRunning, reset } = pomodoro
  const progress = durationSeconds ? (secondsLeft / durationSeconds) * 100 : 0

  return (
    <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Box sx={{ p: 2.5, width: 330, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar src={themeConfig.mascotImage} alt={themeConfig.name} sx={{ width: 46, height: 46, border: `2px solid ${themeConfig.accentColor}` }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }} noWrap>{themeConfig.name}</Typography>
            <Typography variant="caption" color="text.secondary">Pomodoro Focus</Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{themeConfig.quote}</Typography>

        <Box sx={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, mx: 'auto', my: 0.5 }}>
          <CircularProgress variant="determinate" value={100} size={RING_SIZE} thickness={2.5} sx={{ color: 'action.hover', position: 'absolute' }} />
          <CircularProgress
            variant="determinate"
            value={progress}
            size={RING_SIZE}
            thickness={2.5}
            sx={{ color: themeConfig.accentColor, position: 'absolute', '& circle': { strokeLinecap: 'round', transition: 'stroke-dashoffset 0.9s linear' } }}
          />
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 2 }}>{formatTimer(secondsLeft)}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="small"
            color={isRunning ? 'warning' : 'primary'}
            onClick={() => {
              playUiChime('sparkle')
              setIsRunning(!isRunning)
            }}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button variant="outlined" size="small" onClick={() => reset(POMODORO_FOCUS_SECONDS)}>25m Focus</Button>
          <Button variant="outlined" size="small" onClick={() => reset(POMODORO_BREAK_SECONDS)}>5m Break</Button>
        </Box>
      </Box>
    </Popover>
  )
}

export default PomodoroPopover
