import Box from '@mui/material/Box'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import { useTranslation } from '~/customHooks/useTranslation'
import { PRIMARY_THEMES_LIST, ANIME_THEMES } from '~/utils/animeTheme'

function ThemePickerPopover({ anchorEl, onClose, personaKey, onSelect }) {
  const { tPrimary } = useTranslation()
  const activeTheme = ANIME_THEMES[personaKey] || ANIME_THEMES['sora-sky']

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{
        sx: {
          width: 480,
          maxWidth: '94vw',
          borderRadius: '16px',
          p: 2,
          border: `1px solid ${activeTheme.columnBorder}`
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <PaletteOutlinedIcon fontSize="small" sx={{ color: activeTheme.accentColor }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            WORKSPACE THEME GALLERY (01 — 07)
          </Typography>
        </Box>
        <Chip
          size="small"
          icon={<CheckCircleRoundedIcon fontSize="small" />}
          label={activeTheme.name.split('•')[0].trim()}
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, color: '#0f172a', bgcolor: activeTheme.accentColor }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
        {tPrimary('selectThemeSub')}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1 }}>
        {PRIMARY_THEMES_LIST.map((t, idx) => {
          const active = personaKey === t.id
          const idxStr = t.chapterIndex || String(idx + 1).padStart(2, '0')
          return (
            <Box
              key={t.id}
              onClick={(e) => onSelect(t.id, e)}
              sx={{
                p: 1.25,
                minHeight: 82,
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#f8fafc',
                backgroundImage: `linear-gradient(180deg, rgba(9, 13, 22, 0.45) 0%, rgba(9, 13, 22, 0.90) 100%), url(${t.heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: active ? `2px solid ${t.accentColor}` : '1px solid rgba(148, 163, 184, 0.28)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.18s ease, border-color 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', borderColor: t.accentColor }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontFamily: '"JetBrains Mono", Consolas, monospace', fontSize: '0.66rem', fontWeight: 800, color: t.accentColor }}>
                  /{idxStr} • {t.element}
                </Typography>
                {active && (
                  <Chip
                    size="small"
                    label="✓"
                    sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, color: '#0f172a', bgcolor: t.accentColor }}
                  />
                )}
              </Box>
              <Box sx={{ mt: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#f8fafc' }} noWrap>
                  {t.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.76)', display: 'block', fontSize: '0.66rem' }} noWrap>
                  {t.jpTitle}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Popover>
  )
}

export default ThemePickerPopover
