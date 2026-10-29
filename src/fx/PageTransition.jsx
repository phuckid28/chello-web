import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import { useFxTheme } from '~/fx/fxThemeStore'
import { getFxSettings, isMotionReduced, subscribeFxSettings } from '~/fx/fxSettings'
import { useSyncExternalStore } from 'react'
import { getRouteTone, getTransitionKey } from '~/fx/routeTransition'

const TONE_ANIMATION = {
  board: 'fxPageRise 0.42s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  cr: 'fxPageZoom 0.46s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  wiki: 'fxPageSlide 0.42s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  list: 'fxPageRise 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  settings: 'fxPageSlide 0.36s cubic-bezier(0.16, 1, 0.3, 1) backwards'
}

// Wraps routed pages: themed progress bar on top + tone-specific enter animation.
function PageTransition({ children }) {
  const { pathname } = useLocation()
  const { theme } = useFxTheme()
  const settings = useSyncExternalStore(subscribeFxSettings, getFxSettings)
  const animated = settings.transitions && !isMotionReduced()
  const transitionKey = useMemo(() => getTransitionKey(pathname), [pathname])
  const tone = getRouteTone(pathname)

  return (
    <>
      {animated && (
        <Box
          key={`bar-${transitionKey}`}
          aria-hidden="true"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 2500,
            pointerEvents: 'none',
            transformOrigin: 'left center',
            background: `linear-gradient(90deg, ${theme.accentColor}, ${theme.secondaryAccent})`,
            boxShadow: `0 0 10px ${theme.accentColor}`,
            animation: 'fxRouteBar 0.75s cubic-bezier(0.22, 1, 0.36, 1) both'
          }}
        />
      )}
      <Box key={transitionKey} sx={{ animation: animated ? TONE_ANIMATION[tone] : 'none' }}>
        {children}
      </Box>
    </>
  )
}

export default PageTransition
