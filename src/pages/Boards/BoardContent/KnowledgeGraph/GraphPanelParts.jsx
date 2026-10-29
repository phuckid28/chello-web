import { useState } from 'react'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { TEXT_MUTED, TEXT_PRIMARY } from './graphUiStyles'

// Collapsible section header in the style of the Obsidian graph settings
export function PanelSection({ title, defaultOpen = true, action = null, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Box sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.14)', py: 0.5 }}>
      <Box
        onClick={() => setOpen(v => !v)}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5, py: 0.75, cursor: 'pointer', userSelect: 'none' }}
      >
        <ExpandMoreRoundedIcon
          sx={{ fontSize: 18, color: TEXT_MUTED, transition: 'transform 0.2s ease', transform: open ? 'none' : 'rotate(-90deg)' }}
        />
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: TEXT_PRIMARY, flex: 1 }}>
          {title}
        </Typography>
        {action && <Box onClick={(e) => e.stopPropagation()}>{action}</Box>}
      </Box>
      <Collapse in={open} timeout={200} unmountOnExit>
        <Box sx={{ pb: 1, px: 0.5 }}>{children}</Box>
      </Collapse>
    </Box>
  )
}

export function SwitchRow({ label, checked, onChange, color, trailing = null }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.1 }}>
      {color && <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />}
      <Typography variant="body2" sx={{ flex: 1, color: TEXT_PRIMARY, fontSize: '0.8rem' }} noWrap>{label}</Typography>
      {trailing}
      <Switch size="small" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </Box>
  )
}

export function SliderRow({ label, value, limits, onChange }) {
  return (
    <Box sx={{ px: 0.5, py: 0.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: TEXT_MUTED, fontWeight: 600 }}>{label}</Typography>
        <Typography variant="caption" sx={{ color: TEXT_PRIMARY, fontWeight: 700 }}>
          {Number.isInteger(limits.step) ? Math.round(value) : value.toFixed(2)}
        </Typography>
      </Box>
      <Slider
        size="small"
        min={limits.min}
        max={limits.max}
        step={limits.step}
        value={value}
        onChange={(_, v) => onChange(v)}
        sx={{ py: 0.75 }}
      />
    </Box>
  )
}
