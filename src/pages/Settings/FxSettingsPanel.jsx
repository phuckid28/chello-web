import { useMemo, useSyncExternalStore } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded'
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded'
import { useTranslation } from '~/customHooks/useTranslation'
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

function CursorPreviewTile({ theme }) {
  const { values, uris } = useMemo(() => {
    const colors = { accent: theme.accentColor, secondary: theme.secondaryAccent }
    return { values: buildCursorValues(theme.id, colors), uris: buildCursorUris(theme.id, colors) }
  }, [theme])
  return (
    <Box
      style={{ cursor: values.defaultCursor }}
      sx={{
        p: 1.25,
        borderRadius: '14px',
        border: `1px solid ${theme.columnBorder}`,
        background: `linear-gradient(135deg, ${theme.accentColor}14, transparent 70%)`,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 22px ${theme.accentColor}33` }
      }}
    >
      <Avatar src={theme.mascotImage} alt="" sx={{ width: 40, height: 40, border: `2px solid ${theme.accentColor}` }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{theme.name}</Typography>
        <Box style={{ cursor: values.pointerCursor }} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25, width: 'fit-content' }}>
          <img src={uris.defaultUri} width={28} height={28} alt="" />
          <img src={uris.pointerUri} width={28} height={28} alt="" />
        </Box>
      </Box>
    </Box>
  )
}

function FxSettingsPanel() {
  const { t } = useTranslation()
  const settings = useSyncExternalStore(subscribeFxSettings, getFxSettings)

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>🎨 {t('fxTitle')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('fxSub')}</Typography>

      {isMotionReduced() && <Alert severity="info" sx={{ mb: 2 }}>{t('fxReduceNote')}</Alert>}
      {!isFinePointer() && <Alert severity="info" sx={{ mb: 2 }}>{t('fxTouchNote')}</Alert>}

      <Stack spacing={1} sx={{ mb: 3 }}>
        {TOGGLES.map(item => (
          <Box
            key={item.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'background 0.2s ease',
              '&:hover': { bgcolor: 'action.hover' }
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

      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t('fxPreview')}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>{t('fxPreviewHint')}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1.25, mb: 2.5 }}>
        {PRIMARY_THEMES_LIST.map(theme => <CursorPreviewTile key={theme.id} theme={theme} />)}
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
