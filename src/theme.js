import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const APP_BAR_HEIGHT = '62px'
const BOARD_BAR_HEIGHT = '62px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '52px'
const COLUMN_FOOTER_HEIGHT = '56px'

const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Quicksand", "Noto Sans JP", sans-serif'
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0284c7'
        },
        secondary: {
          main: '#db2777'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#7dd3fc'
        },
        secondary: {
          main: '#f472b6'
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
          borderRadius: '9px',
          borderWidth: '1px',
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderWidth: '1.5px',
            transform: 'translateY(-1.5px)'
          },
          '&:active': {
            transform: 'translateY(0px) scale(0.98)'
          }
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
          borderRadius: '9px',
          transition: 'all 0.2s ease',
          '& fieldset': {
            borderWidth: '1px !important'
          },
          '&:hover fieldset': {
            borderWidth: '2px !important'
          },
          '&.Mui-focused fieldset': {
            borderWidth: '2px !important'
          }
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
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
            transform: 'translateY(12px) scale(0.985)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          }
        },
        '@keyframes chelloPulseHalo': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(244, 114, 182, 0.45), 0 0 14px rgba(125, 211, 252, 0.35)'
          },
          '50%': {
            boxShadow: '0 0 0 6px rgba(244, 114, 182, 0), 0 0 24px rgba(125, 211, 252, 0.65)'
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
        // Respect OS-level "reduce motion" preference for every decorative animation
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important'
          }
        },
        body: {
          '*::-webkit-scrollbar': {
            width: '7px',
            height: '7px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(148, 163, 184, 0.48)',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(125, 211, 252, 0.78)'
          }
        }
      }
    }
  }
})

export default theme
