import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded'
import { ANIME_THEMES, PRIMARY_THEMES_LIST, ANIME_BOARD_TEMPLATES } from '~/utils/animeTheme'
import { SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'

function AwwwardsWorkspaceHero({
  themeConfig,
  globalPersonaKey,
  totalBoards,
  starredCount,
  onSwitchPersona,
  onOpenCreateModal,
  onQuickCreateTemplate,
  t
}) {
  const chapterIndex = themeConfig.chapterIndex || '03'
  const awwwardsLabel = themeConfig.awwwardsLabel || 'Swiss Editorial Grid • Distant Sky'
  const archetypeCode = (themeConfig.styleArchetype || 'achromatic-ledger').toUpperCase()

  return (
    <Box sx={{ mx: { xs: 2, md: 4 }, mt: 3, mb: 4 }}>
      {/* Main Awwwards SOTD Editorial Spread & Asymmetric Bento Hero */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          color: '#f8fafc',
          backgroundImage: `${themeConfig.boardOverlayDark}, url(${themeConfig.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: `1px solid ${themeConfig.columnBorder}`,
          boxShadow: '0 20px 52px rgba(0, 0, 0, 0.36)'
        }}
      >
        {/* Top Swiss Editorial Index Hairline Bar */}
        <Box
          sx={{
            px: { xs: 2.5, md: 4 },
            py: 1.35,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            bgcolor: 'rgba(9, 13, 22, 0.72)',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            <Typography
              component="span"
              sx={{
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: themeConfig.accentColor,
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              ISSUE Nº {chapterIndex} / 07
            </Typography>
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.28)' }}>/</Box>
            <Typography
              component="span"
              sx={{
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(248, 250, 252, 0.88)'
              }}
            >
              {awwwardsLabel}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SoraRibbonIcon sx={{ fontSize: 16 }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: 'rgba(248, 250, 252, 0.86)'
              }}
            >
              Chella — A clone of &quot;C&quot;onfluence - tr&quot;ELL&quot;o - jir&quot;A&quot;
            </Typography>
          </Box>
        </Box>

        {/* Asymmetric Split Spread */}
        <Grid container spacing={0}>
          {/* Left 8 Cols: Japanese Minimal Vertical Signature + Display Typography + Editorial Switcher */}
          <Grid
            xs={12}
            md={8}
            sx={{
              p: { xs: 2.5, md: 4.5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRight: { xs: 'none', md: '1px solid rgba(255, 255, 255, 0.12)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: { xs: 2, md: 3 } }}>
              {/* Vertical Japanese Kanji Column (Awwwards Japanese Minimal Motif) */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  px: 1.1,
                  borderRadius: '10px',
                  bgcolor: 'rgba(9, 13, 22, 0.56)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(10px)',
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
                    color: themeConfig.accentColor,
                    lineHeight: 1.4
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
                    color: 'rgba(248, 250, 252, 0.65)',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {chapterIndex}
                </Typography>
              </Box>

              {/* Editorial Display Title & Framed Manifesto Quote */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={themeConfig.element}
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      color: '#0f172a',
                      bgcolor: themeConfig.accentColor
                    }}
                  />
                  {themeConfig.archetypeLabel && (
                    <Chip
                      size="small"
                      label={themeConfig.archetypeLabel}
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#f8fafc',
                        bgcolor: 'rgba(15, 23, 42, 0.68)',
                        border: '1px solid rgba(255, 255, 255, 0.18)'
                      }}
                    />
                  )}
                </Box>

                <Typography
                  component="h1"
                  sx={{
                    fontSize: 'clamp(1.85rem, 3.2vw, 2.85rem)',
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    textWrap: 'balance',
                    mb: 2,
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.55)'
                  }}
                >
                  {themeConfig.name}
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(9, 13, 22, 0.64)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    maxWidth: '64ch'
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: 'italic',
                      lineHeight: 1.65,
                      color: 'rgba(248, 250, 252, 0.94)',
                      mb: 0.75
                    }}
                  >
                    {themeConfig.quote}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: themeConfig.accentColor
                    }}
                  >
                    — {themeConfig.characterName}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 7-Chapter Editorial Theme Switcher Bar */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(248, 250, 252, 0.72)'
                }}
              >
                SELECT ART-DIRECTION CHAPTER (01 — 07)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.85 }}>
                {PRIMARY_THEMES_LIST.map((p, idx) => {
                  const active = globalPersonaKey === p.id
                  const num = p.chapterIndex || String(idx + 1).padStart(2, '0')
                  return (
                    <Button
                      key={p.id}
                      size="small"
                      startIcon={<Avatar src={p.mascotImage} sx={{ width: 18, height: 18 }} />}
                      variant={active ? 'contained' : 'outlined'}
                      onClick={(e) => onSwitchPersona(p.id, e)}
                      sx={{
                        px: 1.35,
                        py: 0.55,
                        borderRadius: '9px',
                        color: active ? '#0f172a' : '#f8fafc',
                        fontWeight: active ? 800 : 600,
                        fontSize: '0.76rem',
                        borderColor: active ? p.accentColor : 'rgba(255, 255, 255, 0.24)',
                        bgcolor: active ? p.accentColor : 'rgba(9, 13, 22, 0.58)',
                        backdropFilter: 'blur(8px)',
                        transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease',
                        '&:hover': {
                          bgcolor: p.accentColor,
                          color: '#0f172a',
                          borderColor: p.accentColor
                        }
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontFamily: '"JetBrains Mono", Consolas, monospace',
                          fontSize: '0.68rem',
                          opacity: 0.78,
                          mr: 0.5,
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      >
                        {num}
                      </Box>
                      {p.name.split('•')[0].trim()}
                    </Button>
                  )
                })}
              </Box>
            </Box>
          </Grid>

          {/* Right 4 Cols: Asymmetric Bento Telemetry Ledger + Primary Sprint Action */}
          <Grid
            xs={12}
            md={4}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
              bgcolor: 'rgba(9, 13, 22, 0.56)',
              backdropFilter: 'blur(16px)'
            }}
          >
            {/* Curator / Companion Header Tile */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: '14px',
                bgcolor: 'rgba(15, 23, 42, 0.74)',
                border: `1px solid ${themeConfig.columnBorder}`
              }}
            >
              <Avatar
                src={themeConfig.portraitImage || themeConfig.mascotImage}
                alt={themeConfig.characterName}
                sx={{ width: 56, height: 56, border: `2px solid ${themeConfig.accentColor}` }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: themeConfig.accentColor
                  }}
                >
                  CURATED REALM • {chapterIndex}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }} noWrap>
                  {themeConfig.characterName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.72)' }} noWrap>
                  Sprint • CR Studio • Knowledge Graph
                </Typography>
              </Box>
            </Box>

            {/* 2x2 Bento KPI Matrix */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'rgba(15, 23, 42, 0.68)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'rgba(248, 250, 252, 0.64)'
                  }}
                >
                  01 / SPRINTS
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.55rem',
                    fontWeight: 800,
                    lineHeight: 1.15,
                    mt: 0.25,
                    color: '#f8fafc',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {String(totalBoards || 0).padStart(2, '0')}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'rgba(15, 23, 42, 0.68)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", Consolas, monospace',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'rgba(248, 250, 252, 0.64)'
                  }}
                >
                  02 / STARRED
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.55rem',
                    fontWeight: 800,
                    lineHeight: 1.15,
                    mt: 0.25,
                    color: '#fbbf24',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {String(starredCount || 0).padStart(2, '0')}
                </Typography>
              </Box>

              <Box
                sx={{
                  gridColumn: '1 / -1',
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'rgba(15, 23, 42, 0.68)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: 'rgba(248, 250, 252, 0.64)'
                    }}
                  >
                    03 / ACTIVE ENGINE ARCHETYPE
                  </Typography>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: themeConfig.accentColor, mt: 0.2 }}>
                    {archetypeCode}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: themeConfig.accentColor }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: themeConfig.secondaryAccent }} />
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<LibraryAddIcon />}
              endIcon={<NorthEastRoundedIcon fontSize="small" />}
              onClick={onOpenCreateModal}
              sx={{
                py: 1.35,
                fontWeight: 800,
                borderRadius: '12px',
                color: '#0f172a',
                background: `linear-gradient(135deg, #f8fafc 0%, ${themeConfig.accentColor} 65%, ${themeConfig.secondaryAccent} 100%)`,
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.28)',
                '&:hover': {
                  opacity: 0.94
                }
              }}
            >
              {t('createNewSprintBoard')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Interactive Awwwards Gallery Strip for the 7 Curated Sprint Blueprints */}
      <Box sx={{ mt: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25, px: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"JetBrains Mono", Consolas, monospace',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'text.secondary'
            }}
          >
            00 / INSTANT SPRINT BLUEPRINTS — INTERACTIVE EXHIBITION REEL
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
            {t('templatesSidebarTitle')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1.25,
            minHeight: { md: 118 }
          }}
        >
          {ANIME_BOARD_TEMPLATES.map((tpl, idx) => {
            const tplTheme = ANIME_THEMES[tpl.theme] || themeConfig
            const isCurrent = globalPersonaKey === tpl.theme
            const idxStr = String(idx + 1).padStart(2, '0')
            return (
              <Box
                key={tpl.id}
                onClick={() => onQuickCreateTemplate(tpl)}
                sx={{
                  flex: { xs: '1 1 auto', md: isCurrent ? '1.55 1 0%' : '1 1 0%' },
                  position: 'relative',
                  p: 1.75,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  color: '#f8fafc',
                  backgroundImage: `linear-gradient(180deg, rgba(9, 13, 22, 0.45) 0%, rgba(9, 13, 22, 0.88) 100%), url(${tplTheme.heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: isCurrent ? `1.5px solid ${tplTheme.accentColor}` : '1px solid rgba(148, 163, 184, 0.26)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'flex 0.36s cubic-bezier(0.22, 1, 0.36, 1), transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s ease',
                  '&:hover': {
                    flex: { md: '1.85 1 0%' },
                    transform: 'translateY(-2px)',
                    borderColor: tplTheme.accentColor
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: tplTheme.accentColor,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    /{idxStr}
                  </Typography>
                  <NorthEastRoundedIcon sx={{ fontSize: 15, color: 'rgba(248, 250, 252, 0.78)' }} />
                </Box>

                <Box sx={{ mt: 1.5 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      lineHeight: 1.25,
                      color: '#f8fafc'
                    }}
                    noWrap
                  >
                    {tpl.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'rgba(248, 250, 252, 0.75)',
                      fontWeight: 600,
                      mt: 0.25
                    }}
                    noWrap
                  >
                    {tpl.badge}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}

export default AwwwardsWorkspaceHero
