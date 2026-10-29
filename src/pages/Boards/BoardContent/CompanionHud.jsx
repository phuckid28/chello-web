import { useState } from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { playUiChime } from '~/utils/soundEffects'
import { getCompanionLines } from '~/utils/companionLines'
import { useTranslation } from '~/customHooks/useTranslation'

const MINIMIZED_STORAGE_KEY = 'chella_companion_minimized'

const readMinimized = () => {
  try {
    return localStorage.getItem(MINIMIZED_STORAGE_KEY) === 'true'
  } catch (e) {
    // Storage unavailable — default to an expanded companion
    return false
  }
}

const persistMinimized = (value) => {
  try {
    localStorage.setItem(MINIMIZED_STORAGE_KEY, String(value))
  } catch (e) {
    // Non-critical preference; ignore storage failures
  }
}

// Visual-novel style companion dialogue box anchored to the bottom-right of the board
function CompanionHud({ personaKey, themeConfig, sprintName }) {
  const { lang } = useTranslation()
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [minimized, setMinimized] = useState(readMinimized)
  const lines = getCompanionLines(personaKey, lang, sprintName)

  const toggleMinimized = (next) => {
    setMinimized(next)
    persistMinimized(next)
  }

  const nextLine = () => {
    playUiChime('sparkle')
    setQuoteIdx(prev => (prev + 1) % lines.length)
  }

  if (minimized) {
    return (
      <Tooltip title={themeConfig.characterName} placement="left">
        <Avatar
          src={themeConfig.mascotImage}
          alt={themeConfig.characterName}
          onClick={() => {
            playUiChime('sparkle')
            toggleMinimized(false)
          }}
          sx={{
            position: 'absolute',
            right: 18,
            bottom: 16,
            zIndex: 2,
            width: 48,
            height: 48,
            cursor: 'pointer',
            border: `2px solid ${themeConfig.accentColor}`,
            animation: 'chelloPulseHalo 2.6s infinite',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'scale(1.08)' }
          }}
        />
      </Tooltip>
    )
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        right: 18,
        bottom: 16,
        zIndex: 2,
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        gap: 1.5,
        px: 1.75,
        py: 1.15,
        borderRadius: '18px',
        userSelect: 'none',
        bgcolor: 'rgba(15, 23, 42, 0.84)',
        backdropFilter: 'blur(16px) saturate(160%)',
        border: `1px solid ${themeConfig.accentColor}`,
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.42)',
        animation: 'chelloFadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': { transform: 'translateY(-3px)', borderColor: themeConfig.secondaryAccent }
      }}
    >
      <Avatar
        src={themeConfig.mascotImage}
        alt={themeConfig.characterName}
        onClick={nextLine}
        sx={{
          width: 46,
          height: 46,
          cursor: 'pointer',
          border: `2px solid ${themeConfig.accentColor}`,
          animation: 'chelloPulseHalo 3s infinite'
        }}
      />
      <Box onClick={nextLine} sx={{ maxWidth: 270, minWidth: 0, cursor: 'pointer' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25, minWidth: 0 }}>
          <SoraBunnyIcon sx={{ fontSize: 15, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontWeight: 800, color: themeConfig.accentColor, letterSpacing: 0.3 }} noWrap>
            【 {themeConfig.characterName} 】
          </Typography>
          <SoraRibbonIcon sx={{ fontSize: 13, flexShrink: 0 }} />
        </Box>
        <Typography
          key={quoteIdx}
          variant="caption"
          sx={{
            color: 'rgba(248, 250, 252, 0.92)',
            display: 'block',
            lineHeight: 1.35,
            animation: 'chelloFadeSlideUp 0.3s ease'
          }}
        >
          “{lines[quoteIdx % lines.length]}”
        </Typography>
      </Box>
      <IconButton
        size="small"
        aria-label="minimize companion"
        onClick={() => toggleMinimized(true)}
        sx={{ color: 'rgba(248, 250, 252, 0.65)', p: 0.4, flexShrink: 0, '&:hover': { color: 'white' } }}
      >
        <CloseFullscreenRoundedIcon sx={{ fontSize: 15 }} />
      </IconButton>
    </Box>
  )
}

export default CompanionHud
