import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import HubRoundedIcon from '@mui/icons-material/HubRounded'
import ViewTimelineRoundedIcon from '@mui/icons-material/ViewTimelineRounded'
import { useTranslation } from '~/customHooks/useTranslation'
import { playUiChime } from '~/utils/soundEffects'

const VIEWS = [
  { id: 'kanban', labelKey: 'viewKanban', Icon: ViewKanbanOutlinedIcon, color: null },
  { id: 'overview', labelKey: 'viewMatrix', Icon: InsightsRoundedIcon, color: '#f472b6' },
  { id: 'timeline', labelKey: 'viewTimeline', Icon: ViewTimelineRoundedIcon, color: '#34d399' },
  { id: 'graph', labelKey: 'viewGraph', Icon: HubRoundedIcon, color: '#a78bfa' }
]

function ViewSwitcher({ value, onChange, accentColor }) {
  const { tPrimary } = useTranslation()

  return (
    <Box
      role="tablist"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.4,
        p: 0.35,
        borderRadius: '10px',
        bgcolor: 'rgba(15, 23, 42, 0.55)',
        border: '1px solid rgba(255,255,255,0.22)',
        flexShrink: 0
      }}
    >
      {VIEWS.map(({ id, labelKey, Icon, color }) => {
        const active = value === id
        return (
          <Chip
            key={id}
            role="tab"
            aria-selected={active}
            size="small"
            icon={<Icon fontSize="small" />}
            label={tPrimary(labelKey)}
            onClick={() => {
              if (active) return
              playUiChime('sparkle')
              onChange(id)
            }}
            clickable
            sx={{
              height: 24,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'white',
              bgcolor: active ? (color || accentColor) : 'transparent',
              boxShadow: active ? '0 2px 10px rgba(0,0,0,0.25)' : 'none',
              transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
              '.MuiSvgIcon-root': { color: 'white !important' }
            }}
          />
        )
      })}
    </Box>
  )
}

export default ViewSwitcher
