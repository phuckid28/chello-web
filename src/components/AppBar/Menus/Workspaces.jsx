import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { PRIMARY_THEMES_LIST, SORA_PRESET_COVERS } from '~/utils/animeTheme'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { runWithReveal } from '~/fx/themeReveal'
import { fxBurst } from '~/fx/fxEvents'
import { ArtworkLightboxModal } from '~/pages/Boards/CreateBoardModal'
import {
  getDefaultTrackForTheme,
  isMusicBoxActive,
  playOstTrack,
  playUiChime
} from '~/utils/soundEffects'

function Workspaces() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [previewArt, setPreviewArt] = useState(null)
  const open = Boolean(anchorEl)
  const { globalPersonaKey, themeConfig, changePersona } = usePersonaTheme()
  const { t, tPrimary } = useTranslation()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelectPersona = (key, event) => {
    playUiChime('theme')
    if (event?.currentTarget) fxBurst(event.currentTarget, 14)
    runWithReveal(event, () => changePersona(key))
    if (isMusicBoxActive()) {
      playOstTrack(getDefaultTrackForTheme(key))
    }
    handleClose()
  }

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Button
        sx={{
          color: 'white',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          textTransform: 'none',
          px: 1.25,
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.16)',
            borderColor: themeConfig.accentColor
          }
        }}
        id="basic-button-workspaces"
        aria-controls={open ? 'basic-menu-workspaces' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<PaletteOutlinedIcon fontSize="small" sx={{ color: themeConfig.accentColor }} />}
        endIcon={<ExpandMoreIcon />}
      >
        {tPrimary('themeMenu')} • {themeConfig.name.split('•')[0].trim()}
      </Button>

      <Popover
        id="basic-menu-workspaces"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: 560,
            maxWidth: '94vw',
            maxHeight: '84vh',
            overflowY: 'auto',
            borderRadius: '16px',
            p: 2,
            border: `1px solid ${themeConfig.columnBorder}`,
            boxShadow: '0 24px 56px rgba(0, 0, 0, 0.42)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteOutlinedIcon fontSize="small" sx={{ color: themeConfig.accentColor }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.04em' }}>
              WORKSPACE THEME GALLERY (01 — 07)
            </Typography>
          </Box>
          <Chip
            size="small"
            icon={<CheckCircleRoundedIcon fontSize="small" />}
            label={themeConfig.name.split('•')[0].trim()}
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, color: '#0f172a', bgcolor: themeConfig.accentColor }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
          {tPrimary('selectThemeSub')} — Thay đổi đồng bộ màu sắc, hình nền và âm thanh cho toàn bộ Web App.
        </Typography>

        {/* Reused Workspace Theme Gallery Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1.15
          }}
        >
          {PRIMARY_THEMES_LIST.map((persona, idx) => {
            const isSelected = globalPersonaKey === persona.id
            const idxStr = persona.chapterIndex || String(idx + 1).padStart(2, '0')
            return (
              <Box
                key={persona.id}
                onClick={(e) => handleSelectPersona(persona.id, e)}
                sx={{
                  position: 'relative',
                  p: 1.35,
                  minHeight: 88,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  color: '#f8fafc',
                  backgroundImage: `linear-gradient(180deg, rgba(9, 13, 22, 0.45) 0%, rgba(9, 13, 22, 0.90) 100%), url(${persona.heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: isSelected
                    ? `2px solid ${persona.accentColor}`
                    : '1px solid rgba(148, 163, 184, 0.28)',
                  boxShadow: isSelected ? `0 0 0 2px ${persona.accentColor}44` : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.18s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: persona.accentColor
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: persona.accentColor,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    /{idxStr} • {persona.element}
                  </Typography>
                  {isSelected && (
                    <Chip
                      size="small"
                      label="✓ Đang bật"
                      sx={{
                        height: 19,
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        bgcolor: persona.accentColor
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#f8fafc' }} noWrap>
                    {persona.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.78)', display: 'block', fontSize: '0.68rem' }} noWrap>
                    {persona.jpTitle}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>

        <Divider sx={{ my: 1.75 }} />

        {/* Preset Artwork Gallery Preview inside Theme Menu */}
        <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.5 }}>
          🖼️ {t('themeGalleryTitle')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {t('themeGallerySub')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.65 }}>
          {SORA_PRESET_COVERS.map((art) => (
            <Box
              key={art.key}
              component="img"
              src={art.url}
              alt={art.label}
              title={`${art.label} (${tPrimary('clickToEnlarge')})`}
              onClick={() => {
                playUiChime('sparkle')
                setPreviewArt(art)
              }}
              sx={{
                display: 'block',
                width: '100%',
                height: 44,
                objectFit: 'cover',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid rgba(148, 163, 184, 0.35)',
                transition: 'transform 0.18s ease, border-color 0.18s ease',
                '&:hover': {
                  transform: 'scale(1.06)',
                  borderColor: themeConfig.accentColor
                }
              }}
            />
          ))}
        </Box>
      </Popover>

      <ArtworkLightboxModal
        previewArt={previewArt}
        onClose={() => setPreviewArt(null)}
        themeConfig={themeConfig}
        tPrimary={tPrimary}
      />
    </Box>
  )
}

export default Workspaces
