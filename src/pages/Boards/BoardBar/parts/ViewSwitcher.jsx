import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import ViewTimelineRoundedIcon from '@mui/icons-material/ViewTimelineRounded'
import { useTranslation } from '~/customHooks/useTranslation'
import { playUiChime } from '~/utils/soundEffects'

const VIEWS = [
  { id: 'overview', labelKey: 'viewMatrix', Icon: InsightsRoundedIcon, color: '#f472b6' },
  { id: 'kanban', labelKey: 'viewKanban', Icon: ViewKanbanOutlinedIcon, color: null },
  { id: 'timeline', labelKey: 'viewTimeline', Icon: ViewTimelineRoundedIcon, color: '#34d399' },
  { id: 'graph', labelKey: 'viewGraph', Icon: HubRoundedIcon, color: '#a78bfa' }
]

const pillSx = (active, activeColor) => ({
  height: 28,
  color: active ? '#0f172a' : 'rgba(248, 250, 252, 0.92)',
  fontWeight: 800,
  fontSize: '0.73rem',
  bgcolor: active ? activeColor : 'transparent',
  border: 'none',
  transition: 'background-color 0.2s cubic-bezier(0.22, 1, 0.36, 1), color 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
  '& .MuiSvgIcon-root': {
    color: active ? '#0f172a' : 'rgba(248, 250, 252, 0.85)',
    fontSize: '16px'
  },
  '& .MuiChip-label': {
    px: 1
  },
  '&:hover': {
    bgcolor: active ? activeColor : 'rgba(255, 255, 255, 0.14)'
  }
})

function ViewSwitcher({ value = 'overview', onChange, accentColor }) {
  const { tPrimary } = useTranslation()

  const handleSelect = (id) => {
    playUiChime('sparkle')
    onChange?.(id)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.35,
        p: 0.35,
        borderRadius: '10px',
        bgcolor: 'rgba(9, 13, 22, 0.65)',
        border: '1px solid rgba(148, 163, 184, 0.26)',
        flexShrink: 0
      }}
    >
      {VIEWS.map(({ id, labelKey, Icon, color }) => {
        const active = value === id
        return (
          <Chip
            key={id}
            size="small"
            icon={<Icon fontSize="small" />}
            label={tPrimary(labelKey)}
            onClick={() => handleSelect(id)}
            clickable
            sx={pillSx(active, color || accentColor)}
          />
        )
      })}
    </Box>
  )
}

export default ViewSwitcher
