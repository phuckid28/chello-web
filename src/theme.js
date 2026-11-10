import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

// Clean-Slate V2 Spatial Architecture: 48px Command Rail + 48px Studio Ribbon = 96px total header
const APP_BAR_HEIGHT = '50px'
const BOARD_BAR_HEIGHT = '48px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '46px'
const COLUMN_FOOTER_HEIGHT = '48px'

// Exponential ease-out (impeccable craft-floor: smooth deceleration, never elastic/bounce)
export const CHELLA_EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'

const DISPLAY_SANS_STACK = 'var(--chella-font-display, "Be Vietnam Pro", "Plus Jakarta Sans", "Noto Sans JP", sans-serif)'

const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  typography: {
    fontFamily: '"Be Vietnam Pro", "Plus Jakarta Sans", "Noto Sans JP", sans-serif',
    h1: { fontFamily: DISPLAY_SANS_STACK, letterSpacing: '-0.02em', fontWeight: 800, lineHeight: 1.22, textWrap: 'balance' },
    h2: { fontFamily: DISPLAY_SANS_STACK, letterSpacing: '-0.018em', fontWeight: 800, lineHeight: 1.25, textWrap: 'balance' },
    h3: { fontFamily: DISPLAY_SANS_STACK, letterSpacing: '-0.015em', fontWeight: 800, lineHeight: 1.28, textWrap: 'balance' },
    h4: { fontFamily: DISPLAY_SANS_STACK, letterSpacing: '-0.014em', fontWeight: 800, lineHeight: 1.28, textWrap: 'balance' },
    h5: { fontFamily: DISPLAY_SANS_STACK, letterSpacing: '-0.012em', fontWeight: 800, textWrap: 'balance' },
    h6: { fontFamily: DISPLAY_SANS_STACK, letterSpacing: '-0.01em', fontWeight: 800, textWrap: 'balance' }
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0284c7'
        },
        secondary: {
          main: '#db2777'
        },
        background: {
          default: '#f4f6f9',
          paper: '#ffffff'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#38bdf8'
        },
        secondary: {
          main: '#f472b6'
        },
        background: {
          default: '#090c14',
          paper: '#111623'
        }
      }
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '-0.005em',
          borderRadius: 'var(--chella-radius-control, 8px)',
          borderWidth: '1px',
          transition: `transform 0.2s var(--chella-spring-curve, ${CHELLA_EASE_OUT}), background-color 0.18s ${CHELLA_EASE_OUT}, border-color 0.18s ${CHELLA_EASE_OUT}, box-shadow 0.2s var(--chella-spring-curve, ${CHELLA_EASE_OUT})`,
          '&:hover': {
            borderWidth: '1px',
            transform: 'translateY(-1px)'
          },
          '&:active': {
            transform: 'translateY(0px) scale(var(--chella-card-active-scale, 0.985))'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.005em',
          transition: `transform 0.18s var(--chella-spring-curve, ${CHELLA_EASE_OUT}), background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease`,
          '&.MuiChip-clickable:hover': {
            transform: 'translateY(-1px)'
          },
          '&.MuiChip-clickable:active': {
            transform: 'scale(0.97)'
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          animation: `chelloFadeSlideUp 0.26s var(--chella-spring-curve, ${CHELLA_EASE_OUT})`
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          backdropFilter: 'blur(var(--chella-glass-blur, 14px))'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontVariantNumeric: 'tabular-nums'
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem'
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-body1': { fontSize: '0.875rem' }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 'var(--chella-radius-control, 8px)',
          transition: `border-color 0.18s ${CHELLA_EASE_OUT}, box-shadow 0.18s ${CHELLA_EASE_OUT}`,
          '& fieldset': {
            borderWidth: '1px !important'
          },
          '&:hover fieldset': {
            borderWidth: '1.5px !important'
          },
          '&.Mui-focused fieldset': {
            borderWidth: '2px !important'
          }
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'light dark',
          '--chella-ease-out': CHELLA_EASE_OUT
        },
        'html[data-mui-color-scheme="light"]': {
          colorScheme: 'light'
        },
        'html[data-mui-color-scheme="dark"]': {
          colorScheme: 'dark'
        },
        '::selection': {
          backgroundColor: 'color-mix(in oklab, var(--fx-accent, #38bdf8) 28%, transparent)',
          color: 'inherit'
        },
        'input, textarea': {
          caretColor: 'var(--fx-accent, #38bdf8)'
        },
        'a:not(.MuiButtonBase-root)': {
          textUnderlineOffset: '0.2em',
          textDecorationThickness: '1px'
        },
        ':focus-visible': {
          outline: '2px solid var(--fx-accent, #38bdf8)',
          outlineOffset: '2px'
        },
        '@media (forced-colors: active)': {
          '*, *::before, *::after': {
            borderColor: 'CanvasText'
          }
        },
        '@keyframes chelloFloat': {
          '0%, 100%': {
            transform: 'translate3d(0px, 0px, 0px) rotate(0deg)',
            opacity: 0.42
          },
          '50%': {
            transform: 'translate3d(8px, -20px, 0px) rotate(10deg)',
            opacity: 0.88
          }
        },
        '@keyframes chelloFadeSlideUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(8px) scale(0.992)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          }
        },
        '@keyframes chelloPulseHalo': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.42), 0 0 12px rgba(56, 189, 248, 0.28)'
          },
          '50%': {
            boxShadow: '0 0 0 5px rgba(239, 68, 68, 0), 0 0 20px rgba(56, 189, 248, 0.5)'
          }
        },
        '@keyframes chelloTimelineGrow': {
          '0%': { opacity: 0, transform: 'scaleX(0.2)' },
          '100%': { opacity: 1, transform: 'scaleX(1)' }
        },
        '@keyframes chelloShimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important'
          }
        },
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          '*::-webkit-scrollbar': {
            width: '6px',
            height: '6px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(148, 163, 184, 0.36)',
            borderRadius: '6px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--fx-accent, rgba(56, 189, 248, 0.78))'
          }
        }
      }
    }
  }
})

export default theme
