import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { useTranslation } from '~/customHooks/useTranslation'
import { OPEN_SHORTCUTS_EVENT } from '~/fx/fxEvents'

const GROUPS = [
  {
    title: 'shortcutsGeneral',
    items: [
      { keys: ['Ctrl', 'K'], label: 'scPalette' },
      { keys: ['?'], label: 'scShortcuts' }
    ]
  },
  {
    title: 'shortcutsKnowledge',
    items: [{ keys: ['Ctrl', 'S'], label: 'scSave' }]
  },
  {
    title: 'shortcutsGraph',
    items: [
      { keys: ['F'], label: 'scGraphFit' },
      { keys: ['L'], label: 'scGraphLocal' },
      { keys: ['/'], label: 'scGraphSearch' },
      { keys: ['+', '−'], label: 'scGraphZoom' },
      { keys: ['←', '↑', '→', '↓'], label: 'scGraphWalk' },
      { keys: ['Esc'], label: 'scGraphClear' }
    ]
  }
]

const isTypingTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function Kbd({ children }) {
  return (
    <Box
      component="kbd"
      sx={{
        px: 0.9,
        py: 0.25,
        minWidth: 24,
        textAlign: 'center',
        borderRadius: '7px',
        border: '1px solid',
        borderColor: 'divider',
        borderBottomWidth: '2px',
        bgcolor: 'action.hover',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.75rem',
        fontWeight: 800
      }}
    >
      {children}
    </Box>
  )
}

// Cheat-sheet opened with "?" (ignored while typing in a field) or via the custom event.
function ShortcutsDialog() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '?' || event.ctrlKey || event.metaKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      setOpen(prev => !prev)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener(OPEN_SHORTCUTS_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(OPEN_SHORTCUTS_EVENT, onOpen)
    }
  }, [])

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '18px' } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>⌨️ {t('shortcutsTitle')}</DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>{t('shortcutsHint')}</Typography>
        {GROUPS.map(group => (
          <Box key={group.title} sx={{ mb: 1.75 }}>
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'primary.main' }}>{t(group.title)}</Typography>
            {group.items.map(item => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 0.6 }}>
                <Typography variant="body2" sx={{ minWidth: 0 }}>{t(item.label)}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  {item.keys.map(k => <Kbd key={k}>{k}</Kbd>)}
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  )
}

export default ShortcutsDialog
