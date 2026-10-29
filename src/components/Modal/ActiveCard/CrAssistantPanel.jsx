import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { requestSubtaskSuggestions } from '~/utils/crAssistant'
import { useTranslation } from '~/customHooks/useTranslation'
import { playUiChime } from '~/utils/soundEffects'

// Inline "CR Assistant" that proposes BA subtasks; the provider behind requestSubtaskSuggestions is swappable
function CrAssistantPanel({ card, onAddItems }) {
  const { tPrimary, lang } = useTranslation()
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  // Close the panel when the user opens a different CR
  useEffect(() => {
    setOpen(false)
    setSuggestions([])
  }, [card?._id])

  const refresh = async () => {
    setLoading(true)
    try {
      setSuggestions(await requestSubtaskSuggestions(card, { lang }))
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    playUiChime('sparkle')
    if (!open) await refresh()
    setOpen(prev => !prev)
  }

  const addAndDrop = async (items) => {
    if (!items.length) return
    await onAddItems(items.map(s => s.title))
    const addedKeys = new Set(items.map(s => s.key))
    setSuggestions(prev => prev.filter(s => !addedKeys.has(s.key)))
  }

  return (
    <Box sx={{ mt: 1.5 }}>
      <Button
        size="small"
        variant={open ? 'contained' : 'outlined'}
        color="secondary"
        startIcon={<AutoAwesomeRoundedIcon />}
        onClick={handleToggle}
        disabled={loading}
        sx={{ fontWeight: 700, borderRadius: '8px' }}
      >
        {tPrimary('assistantBtn')}
      </Button>
      <Collapse in={open} unmountOnExit>
        <Box sx={{
          mt: 1.25,
          p: 1.5,
          borderRadius: '12px',
          border: '1px dashed',
          borderColor: 'secondary.main',
          background: (theme) => (theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(244,114,182,0.08), rgba(125,211,252,0.06))'
            : 'linear-gradient(135deg, rgba(219,39,119,0.05), rgba(2,132,199,0.05))')
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{tPrimary('assistantTitle')}</Typography>
            <Button size="small" disabled={!suggestions.length} onClick={() => addAndDrop(suggestions)} sx={{ fontWeight: 700 }}>
              {tPrimary('assistantAddAll')}
            </Button>
          </Box>
          {suggestions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{tPrimary('assistantEmpty')}</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {suggestions.map((s, idx) => (
                <Chip
                  key={s.key}
                  icon={<AddRoundedIcon />}
                  label={s.title}
                  onClick={() => addAndDrop([s])}
                  variant="outlined"
                  sx={{
                    justifyContent: 'flex-start',
                    height: 'auto',
                    py: 0.5,
                    fontWeight: 600,
                    '& .MuiChip-label': { whiteSpace: 'normal' },
                    borderColor: s.ruleId === 'base' ? 'divider' : 'secondary.main',
                    animation: `chelloFadeSlideUp 0.28s ease ${idx * 0.04}s both`
                  }}
                />
              ))}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{tPrimary('assistantHint')}</Typography>
        </Box>
      </Collapse>
    </Box>
  )
}

export default CrAssistantPanel
