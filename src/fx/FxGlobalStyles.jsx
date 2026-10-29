import GlobalStyles from '@mui/material/GlobalStyles'

// Keyframes + global rules shared by cursors, loaders, page transitions and theme reveal
const FX_STYLES = {
  // ---------- Themed cursor ----------
  'html[data-fx-cursor="on"], html[data-fx-cursor="on"] body': {
    cursor: 'var(--fx-cursor-default)'
  },
  'html[data-fx-cursor="on"] :is(a[href], button:not(:disabled), [role="button"], [role="tab"], [role="menuitem"], [role="option"], summary, select, label[for], input[type="checkbox"], input[type="radio"], input[type="range"], [data-fx-pointer])': {
    cursor: 'var(--fx-cursor-pointer) !important'
  },

  // ---------- Loader motions ----------
  '@keyframes fxOrbit': { to: { transform: 'rotate(360deg)' } },
  '@keyframes fxTwinkle': { '0%, 100%': { opacity: 0.25, transform: 'scale(0.7)' }, '50%': { opacity: 1, transform: 'scale(1.15)' } },
  '@keyframes fxSwing': { '0%': { transform: 'rotate(-13deg)' }, '100%': { transform: 'rotate(13deg)' } },
  '@keyframes fxFloat': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
  '@keyframes fxRock': { '0%': { transform: 'rotate(-9deg)' }, '100%': { transform: 'rotate(9deg)' } },
  '@keyframes fxHop': {
    '0%, 100%': { transform: 'translateY(0) scale(1.08, 0.9)' },
    '45%': { transform: 'translateY(-12px) scale(0.94, 1.08)' },
    '70%': { transform: 'translateY(-4px) scale(1, 1)' }
  },
  '@keyframes fxShadow': { '0%, 100%': { transform: 'scale(1)', opacity: 0.35 }, '45%': { transform: 'scale(0.62)', opacity: 0.15 } },
  '@keyframes fxDrop': {
    '0%': { transform: 'translateY(-16px) scale(0.6)', opacity: 0 },
    '25%': { opacity: 1 },
    '70%': { transform: 'translateY(8px) scale(1)', opacity: 1 },
    '100%': { transform: 'translateY(10px) scale(0.4)', opacity: 0 }
  },
  '@keyframes fxRipple': { '0%': { transform: 'scale(0.2)', opacity: 0.9 }, '100%': { transform: 'scale(1.5)', opacity: 0 } },
  '@keyframes fxGrow': { '0%': { transform: 'scale(0.25)' }, '60%': { transform: 'scale(1.06)' }, '100%': { transform: 'scale(1)' } },
  '@keyframes fxSway': { '0%': { transform: 'rotate(-5deg)' }, '100%': { transform: 'rotate(5deg)' } },
  '@keyframes fxSpin': { to: { transform: 'rotate(360deg)' } },
  '@keyframes fxPulse': { '0%, 100%': { transform: 'scale(0.85)', opacity: 0.7 }, '50%': { transform: 'scale(1.1)', opacity: 1 } },
  '@keyframes fxDots': { '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 0.4 }, '40%': { transform: 'translateY(-5px)', opacity: 1 } },
  '@keyframes fxSheen': { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(220%)' } },

  // ---------- Page transitions ----------
  '@keyframes fxPageRise': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
  '@keyframes fxPageZoom': { from: { opacity: 0, transform: 'scale(0.975)' }, to: { opacity: 1, transform: 'none' } },
  '@keyframes fxPageSlide': { from: { opacity: 0, transform: 'translateX(26px)' }, to: { opacity: 1, transform: 'none' } },
  '@keyframes fxViewSwap': { from: { opacity: 0, transform: 'translateY(10px) scale(0.99)' }, to: { opacity: 1, transform: 'none' } },
  '@keyframes fxRouteBar': {
    '0%': { transform: 'scaleX(0)', opacity: 1 },
    '70%': { transform: 'scaleX(0.92)', opacity: 1 },
    '100%': { transform: 'scaleX(1)', opacity: 0 }
  },

  // ---------- Card micro-interactions ----------
  '@keyframes fxBarGrow': { from: { transform: 'scaleY(0.1)', opacity: 0 }, to: { transform: 'scaleY(1)', opacity: 1 } },
  '@keyframes fxPop': { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.18)' }, '100%': { transform: 'scale(1)' } },

  // ---------- Theme reveal (View Transitions API) ----------
  '::view-transition-old(root), ::view-transition-new(root)': {
    animation: 'none',
    mixBlendMode: 'normal'
  },
  '::view-transition-old(root)': { zIndex: 1 },
  '::view-transition-new(root)': { zIndex: 2 }
}

function FxGlobalStyles() {
  return <GlobalStyles styles={FX_STYLES} />
}

export default FxGlobalStyles
