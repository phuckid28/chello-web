import { useMemo, useSyncExternalStore } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded'
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { OPEN_SHORTCUTS_EVENT, fxCelebrate } from '~/fx/fxEvents'
import { getFxSettings, isFinePointer, isMotionReduced, setFxSettings, subscribeFxSettings } from '~/fx/fxSettings'
import { buildCursorUris, buildCursorValues } from '~/fx/cursorArt'
import { PRIMARY_THEMES_LIST } from '~/utils/animeTheme'

const TOGGLES = [
  { key: 'cursor', label: 'fxCursor', desc: 'fxCursorDesc' },
  { key: 'trail', label: 'fxTrail', desc: 'fxTrailDesc' },
  { key: 'sparkles', label: 'fxSparkles', desc: 'fxSparklesDesc' },
  { key: 'transitions', label: 'fxTransitions', desc: 'fxTransitionsDesc' },
  { key: 'celebrate', label: 'fxCelebrate', desc: 'fxCelebrateDesc' }
]

function CursorPreviewTile({ theme, active, onSelect }) {
  const { values, uris } = useMemo(() => {
    const colors = { accent: theme.accentColor, secondary: theme.secondaryAccent }
    return { values: buildCursorValues(theme.id, colors), uris: buildCursorUris(theme.id, colors) }
  }, [theme])
  return (
    <Box
      onClick={() => onSelect(theme.id)}
      style={{ cursor: values.defaultCursor }}
      sx={{
        p: 1.5,
        borderRadius: 'var(--chella-radius-card, 12px)',
        border: active ? `1.5px solid ${theme.accentColor}` : `1px solid ${theme.columnBorder}`,
        background: active
          ? `linear-gradient(135deg, ${theme.accentColor}22, transparent 78%)`
          : `linear-gradient(135deg, ${theme.accentColor}10, transparent 72%)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Avatar src={theme.mascotImage} alt="" sx={{ width: 42, height: 42, border: `2px solid ${theme.accentColor}` }} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{theme.name}</Typography>
            {active && <CheckCircleRoundedIcon sx={{ fontSize: 16, color: theme.accentColor, flexShrink: 0 }} />}
          </Box>
          {theme.archetypeLabel && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }} noWrap>
              {theme.archetypeLabel}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
        <Box style={{ cursor: values.pointerCursor }} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 'fit-content' }}>
          <img src={uris.defaultUri} width={26} height={26} alt="" />
          <img src={uris.pointerUri} width={26} height={26} alt="" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.accentColor, border: '1px solid rgba(255,255,255,0.4)' }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.secondaryAccent, border: '1px solid rgba(255,255,255,0.4)' }} />
          <Chip size="small" label={theme.element} sx={{ height: 19, fontSize: '0.65rem', fontWeight: 700, ml: 0.5 }} />
        </Box>
      </Box>
    </Box>
  )
}

function FxSettingsPanel() {
  const { t } = useTranslation()
  const { globalPersonaKey, changePersona } = usePersonaTheme()
  const settings = useSyncExternalStore(subscribeFxSettings, getFxSettings)

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.015em' }}>🎨 {t('fxTitle')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{t('fxSub')}</Typography>

      {isMotionReduced() && <Alert severity="info" sx={{ mb: 2 }}>{t('fxReduceNote')}</Alert>}
      {!isFinePointer() && <Alert severity="info" sx={{ mb: 2 }}>{t('fxTouchNote')}</Alert>}

      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>{t('fxPreview')}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>{t('fxPreviewHint')}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))', gap: 1.5, mb: 3.5 }}>
        {PRIMARY_THEMES_LIST.map(theme => (
          <CursorPreviewTile
            key={theme.id}
            theme={theme}
            active={globalPersonaKey === theme.id}
            onSelect={changePersona}
          />
        ))}
      </Box>

      <Stack spacing={1.25} sx={{ mb: 3 }}>
        {TOGGLES.map(item => (
          <Box
            key={item.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 1.75,
              borderRadius: 'var(--chella-radius-card, 12px)',
              bgcolor: (theme) => (theme.palette.mode === 'dark'
                ? 'var(--chella-raised-dark, #131c31)'
                : 'var(--chella-raised-light, #ffffff)'),
              border: '1px solid',
              borderColor: 'divider',
              transition: 'background 0.2s ease, border-color 0.2s ease',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'var(--fx-accent, #38bdf8)' }
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{t(item.label)}</Typography>
              <Typography variant="caption" color="text.secondary">{t(item.desc)}</Typography>
            </Box>
            <Switch
              checked={settings[item.key]}
              onChange={(e) => setFxSettings({ [item.key]: e.target.checked })}
              inputProps={{ 'aria-label': t(item.label) }}
            />
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" startIcon={<CelebrationRoundedIcon />} onClick={(e) => fxCelebrate(e.currentTarget)}>
          {t('fxTestCelebrate')}
        </Button>
        <Button variant="outlined" startIcon={<KeyboardRoundedIcon />} onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SHORTCUTS_EVENT))}>
          {t('shortcutsTitle')}
        </Button>
      </Stack>
    </Box>
  )
}

export default FxSettingsPanel
