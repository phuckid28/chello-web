import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { useTranslation } from '~/customHooks/useTranslation'
import { PRIMARY_THEMES_LIST } from '~/utils/animeTheme'

function ThemePickerPopover({ anchorEl, onClose, personaKey, onSelect }) {
  const { tPrimary } = useTranslation()

  return (
    <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Box sx={{ p: 2, width: 360, maxWidth: '94vw' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.25 }}>🎨 {tPrimary('selectThemeTitle')}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>{tPrimary('selectThemeSub')}</Typography>
        <Stack spacing={1}>
          {PRIMARY_THEMES_LIST.map((t, idx) => {
            const active = personaKey === t.id
            return (
              <Box
                key={t.id}
                onClick={() => onSelect(t.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  p: 1,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: active ? `2px solid ${t.accentColor}` : '1px solid rgba(148, 163, 184, 0.25)',
                  background: active ? `linear-gradient(90deg, ${t.accentColor}22, transparent)` : 'transparent',
                  animation: `chelloFadeSlideUp 0.28s ease ${idx * 0.035}s both`,
                  transition: 'transform 0.18s ease, background 0.2s ease',
                  '&:hover': { bgcolor: 'action.hover', transform: 'translateX(3px)' }
                }}
              >
                <Avatar src={t.mascotImage} alt={t.name} sx={{ width: 42, height: 42, border: `2px solid ${t.accentColor}` }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{t.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{t.jpTitle}</Typography>
                </Box>
              </Box>
            )
          })}
        </Stack>
      </Box>
    </Popover>
  )
}

export default ThemePickerPopover
