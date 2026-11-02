import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded'
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded'
import { DEFAULT_SPRINT_TEMPLATE } from '~/utils/animeTheme'
import { SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'

function AwwwardsWorkspaceHero({
  themeConfig,
  totalBoards,
  starredCount,
  currentSprintLabel,
  onOpenCreateModal,
  t
}) {
  const chapterIndex = themeConfig.chapterIndex || '03'
  const awwwardsLabel = themeConfig.awwwardsLabel || 'Swiss Editorial Grid • Distant Sky'
  const archetypeCode = (themeConfig.styleArchetype || 'achromatic-ledger').toUpperCase()

  return (
    <Box sx={{ mx: { xs: 2, md: 4 }, mt: 2.5, mb: 3 }}>
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
            py: 1.2,
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
              SPRINT COMMAND CENTER • {currentSprintLabel || 'ACTIVE WORKSPACE'}
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
          {/* Left 8 Cols: Japanese Minimal Vertical Signature + Display Typography + Unified Sprint Template Summary */}
          <Grid
            xs={12}
            md={8}
            sx={{
              p: { xs: 2.5, md: 3.75 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRight: { xs: 'none', md: '1px solid rgba(255, 255, 255, 0.12)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: { xs: 2, md: 3 } }}>
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

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
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
                    fontSize: 'clamp(1.65rem, 2.8vw, 2.55rem)',
                    fontWeight: 800,
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    textWrap: 'balance',
                    mb: 1.5,
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.55)'
                  }}
                >
                  {themeConfig.name}
                </Typography>

                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: '12px',
                    bgcolor: 'rgba(9, 13, 22, 0.64)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    maxWidth: '64ch'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: 'rgba(248, 250, 252, 0.94)',
                      mb: 0.5
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

            <Box
              sx={{
                mt: 2.25,
                p: 1.75,
                borderRadius: '14px',
                bgcolor: 'rgba(9, 13, 22, 0.68)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${themeConfig.columnBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.35, flexWrap: 'wrap' }}>
                  <ViewKanbanRoundedIcon sx={{ fontSize: 16, color: themeConfig.accentColor }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: themeConfig.accentColor
                    }}
                  >
                    UNIFIED SPRINT TEMPLATE • MẪU SPRINT CHUẨN DUY NHẤT
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  {DEFAULT_SPRINT_TEMPLATE.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.76)', display: 'block', mt: 0.2 }}>
                  Mọi Board & Sprint dùng chung 1 template chuẩn; đổi chủ đề giao diện tại menu <b>Giao diện</b> trên thanh điều hướng.
                </Typography>
              </Box>

              <Button
                size="small"
                variant="outlined"
                startIcon={<LibraryAddIcon fontSize="small" />}
                onClick={onOpenCreateModal}
                sx={{
                  flexShrink: 0,
                  fontWeight: 800,
                  borderRadius: '9px',
                  textTransform: 'none',
                  color: '#f8fafc',
                  borderColor: themeConfig.accentColor,
                  bgcolor: 'rgba(15, 23, 42, 0.65)',
                  '&:hover': {
                    bgcolor: themeConfig.accentColor,
                    color: '#0f172a',
                    borderColor: themeConfig.accentColor
                  }
                }}
              >
                {t('createNewSprintBoard')}
              </Button>
            </Box>
          </Grid>

          {/* Right 4 Cols: Asymmetric Bento Telemetry Ledger + Primary Sprint Action */}
          <Grid
            xs={12}
            md={4}
            sx={{
              p: { xs: 2.5, md: 3.25 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1.75,
              bgcolor: 'rgba(9, 13, 22, 0.56)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.35,
                borderRadius: '14px',
                bgcolor: 'rgba(15, 23, 42, 0.74)',
                border: `1px solid ${themeConfig.columnBorder}`
              }}
            >
              <Avatar
                src={themeConfig.portraitImage || themeConfig.mascotImage}
                alt={themeConfig.characterName}
                sx={{ width: 52, height: 52, border: `2px solid ${themeConfig.accentColor}` }}
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
                  ACTIVE WEB APP THEME • {chapterIndex}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }} noWrap>
                  {themeConfig.characterName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.72)' }} noWrap>
                  Sprint Matrix • Kanban • CR Studio • Graph
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.15 }}>
              <Box
                sx={{
                  p: 1.35,
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
                    fontSize: '1.45rem',
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
                  p: 1.35,
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
                    fontSize: '1.45rem',
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
                  p: 1.35,
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
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: themeConfig.accentColor, mt: 0.15 }}>
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
                py: 1.25,
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
    </Box>
  )
}

export default AwwwardsWorkspaceHero
