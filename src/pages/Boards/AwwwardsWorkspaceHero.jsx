import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded'
import { PRIMARY_THEMES_LIST, DEFAULT_SPRINT_TEMPLATE } from '~/utils/animeTheme'
import { SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'

function AwwwardsWorkspaceHero({
  themeConfig,
  globalPersonaKey,
  totalBoards,
  starredCount,
  onSwitchPersona,
  onOpenCreateModal,
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
              THEME Nº {chapterIndex} / 07
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

            {/* Unified Sprint Template Architecture Banner */}
            <Box
              sx={{
                mt: 3,
                p: 2,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
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
                <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.76)', display: 'block', mt: 0.25 }}>
                  Tất cả các Board / Sprint đều dùng chung 1 cấu trúc chuẩn (Sprint Matrix • Kanban 3 cột CR • FRD A4 PDF • Obsidian Graph) và tự động đồng bộ theo giao diện chủ đề của Web App.
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
                  ACTIVE WEB APP THEME • {chapterIndex}
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

      {/* Interactive Awwwards Gallery Strip for the 7 Web App Visual Themes (Strictly Theme Switching Only) */}
      <Box sx={{ mt: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.25, px: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            <PaletteOutlinedIcon sx={{ fontSize: 16, color: themeConfig.accentColor }} />
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
              00 / WORKSPACE THEME GALLERY — CHỦ ĐỀ GIAO DIỆN WEB APP (01 — 07)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              (Nhấn vào bất kỳ chủ đề nào để đổi giao diện toàn bộ Web App & tất cả các bảng Sprint)
            </Typography>
          </Box>

          <Chip
            size="small"
            icon={<CheckCircleRoundedIcon fontSize="small" />}
            label={`Giao diện đang bật: ${themeConfig.name.split('•')[0].trim()}`}
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              bgcolor: themeConfig.accentColor
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1.25,
            minHeight: { md: 124 }
          }}
        >
          {PRIMARY_THEMES_LIST.map((themeItem, idx) => {
            const isCurrent = globalPersonaKey === themeItem.id
            const idxStr = themeItem.chapterIndex || String(idx + 1).padStart(2, '0')
            return (
              <Box
                key={themeItem.id}
                onClick={(e) => onSwitchPersona(themeItem.id, e)}
                sx={{
                  flex: { xs: '1 1 auto', md: isCurrent ? '1.75 1 0%' : '1 1 0%' },
                  position: 'relative',
                  p: 1.75,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  color: '#f8fafc',
                  backgroundImage: `linear-gradient(180deg, rgba(9, 13, 22, 0.45) 0%, rgba(9, 13, 22, 0.90) 100%), url(${themeItem.heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: isCurrent
                    ? `2px solid ${themeItem.accentColor}`
                    : '1px solid rgba(148, 163, 184, 0.26)',
                  boxShadow: isCurrent ? `0 0 0 2px ${themeItem.accentColor}44` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'flex 0.36s cubic-bezier(0.22, 1, 0.36, 1), transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s ease',
                  '&:hover': {
                    flex: { md: '1.85 1 0%' },
                    transform: 'translateY(-2px)',
                    borderColor: themeItem.accentColor
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: themeItem.accentColor,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    /{idxStr}
                  </Typography>
                  {isCurrent ? (
                    <Chip
                      size="small"
                      label="✓ Đang áp dụng"
                      sx={{
                        height: 20,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        bgcolor: themeItem.accentColor
                      }}
                    />
                  ) : (
                    <PaletteOutlinedIcon sx={{ fontSize: 15, color: 'rgba(248, 250, 252, 0.78)' }} />
                  )}
                </Box>

                <Box sx={{ mt: 1.25 }}>
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
                    {themeItem.name}
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
                    {themeItem.element} • {themeItem.archetypeLabel?.split('•')[0]?.trim()}
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
