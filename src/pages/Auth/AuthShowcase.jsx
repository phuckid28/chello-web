import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { PRIMARY_THEMES_LIST } from '~/utils/animeTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'

const PILLARS = [
  { code: '01', title: 'SPRINT KANBAN', sub: '60fps Isolated Columns & Telemetry' },
  { code: '02', title: 'CR SIMULATION STUDIO', sub: 'FRD Vault & Business Flow Verification' },
  { code: '03', title: 'OBSIDIAN GRAPH', sub: 'Bi-Directional [[Wiki]] & Force Network' }
]

// Left column of every auth page: Awwwards split-pinned editorial showcase + theme switcher
function AuthShowcase() {
  const { globalPersonaKey, themeConfig, changePersona } = usePersonaTheme()
  const chapterIndex = themeConfig.chapterIndex || '03'
  const awwwardsLabel = themeConfig.awwwardsLabel || 'Swiss Editorial Grid • Distant Sky'

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 2.5, md: 4 },
        borderRadius: '20px',
        color: '#f8fafc',
        bgcolor: 'rgba(9, 13, 22, 0.72)',
        backdropFilter: 'blur(18px) saturate(160%)',
        border: `1px solid ${themeConfig.columnBorder}`,
        boxShadow: '0 24px 56px rgba(0, 0, 0, 0.38)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 3
      }}
    >
      {/* Top Editorial Index Bar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        pb: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SoraRibbonIcon sx={{ fontSize: 18 }} />
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", Consolas, monospace',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: themeConfig.accentColor,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            CHAPTER {chapterIndex} / 07 — {awwwardsLabel.toUpperCase()}
          </Typography>
        </Box>
        <Chip
          size="small"
          icon={<SoraBunnyIcon fontSize="small" />}
          label={themeConfig.element}
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 800,
            color: '#0f172a',
            bgcolor: themeConfig.accentColor
          }}
        />
      </Box>

      {/* Center Spread: Vertical Japanese Kanji + Display Headline + Manifesto Quote */}
      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.25,
            px: 1.15,
            borderRadius: '10px',
            bgcolor: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            userSelect: 'none'
          }}
        >
          <Typography
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'upright',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: themeConfig.accentColor
            }}
          >
            {themeConfig.jpTitle}
          </Typography>
          <Typography
            sx={{
              mt: 1.5,
              fontFamily: '"JetBrains Mono", Consolas, monospace',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'rgba(248, 250, 252, 0.6)',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {chapterIndex}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: 'rgba(248, 250, 252, 0.75)',
              lineHeight: 1.2,
              mb: 0.75
            }}
          >
            Chella — A clone of &quot;C&quot;onfluence - tr&quot;ELL&quot;o - jir&quot;A&quot;
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontSize: 'clamp(1.75rem, 3vw, 2.65rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              textWrap: 'balance',
              mb: 2
            }}
          >
            {themeConfig.name}
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: 'rgba(15, 23, 42, 0.68)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.65, color: 'rgba(248, 250, 252, 0.92)' }}>
              {themeConfig.quote}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.75,
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: themeConfig.accentColor
              }}
            >
              — {themeConfig.characterName}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 3 Bento Architecture Pillars */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.25 }}>
        {PILLARS.map((pillar) => (
          <Box
            key={pillar.code}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: 'rgba(15, 23, 42, 0.64)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                fontSize: '0.66rem',
                fontWeight: 800,
                color: themeConfig.accentColor,
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              /{pillar.code}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.78rem', mt: 0.35 }}>
              {pillar.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.68)', display: 'block', lineHeight: 1.35, mt: 0.25 }}>
              {pillar.sub}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Bottom 7-Chapter Theme Editorial Switcher */}
      <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1,
            fontFamily: '"JetBrains Mono", Consolas, monospace',
            fontSize: '0.66rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: 'rgba(248, 250, 252, 0.68)'
          }}
        >
          SWITCH REALM EDITION (01 — 07)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {PRIMARY_THEMES_LIST.map((p, idx) => {
            const active = globalPersonaKey === p.id
            const num = p.chapterIndex || String(idx + 1).padStart(2, '0')
            return (
              <Button
                key={p.id}
                size="small"
                startIcon={<Avatar src={p.mascotImage} sx={{ width: 16, height: 16 }} />}
                variant={active ? 'contained' : 'outlined'}
                onClick={() => changePersona(p.id)}
                sx={{
                  color: active ? '#0f172a' : 'rgba(248, 250, 252, 0.88)',
                  minWidth: 'auto',
                  px: 1.15,
                  py: 0.4,
                  fontSize: '0.72rem',
                  fontWeight: active ? 800 : 600,
                  borderRadius: '8px',
                  borderColor: active ? p.accentColor : 'rgba(255, 255, 255, 0.2)',
                  bgcolor: active ? p.accentColor : 'rgba(15, 23, 42, 0.55)',
                  '&:hover': {
                    bgcolor: p.accentColor,
                    color: '#0f172a',
                    borderColor: p.accentColor
                  }
                }}
              >
                <Box component="span" sx={{ fontFamily: '"JetBrains Mono", Consolas, monospace', fontSize: '0.65rem', mr: 0.4, opacity: 0.8 }}>
                  {num}
                </Box>
                {p.element}
              </Button>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default AuthShowcase