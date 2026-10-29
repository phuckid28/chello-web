// Shared glassmorphism chip style for the Sprint board toolbar
export const MENU_STYLES = {
  flexShrink: 0,
  whiteSpace: 'nowrap',
  color: 'white',
  bgcolor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  paddingX: '6px',
  borderRadius: '8px',
  fontWeight: 600,
  backdropFilter: 'blur(6px)',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.22)',
    transform: 'translateY(-1px)'
  }
}

export const POMODORO_FOCUS_SECONDS = 25 * 60
export const POMODORO_BREAK_SECONDS = 5 * 60
