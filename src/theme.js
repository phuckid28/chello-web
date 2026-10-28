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
          main: '#2563eb'
        },
        secondary: {
          main: '#10b981'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#38bdf8'
        },
        secondary: {
          main: '#34d399'
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
          borderRadius: '8px',
          borderWidth: '1px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderWidth: '1.5px',
            transform: 'translateY(-1px)'
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
          borderRadius: '8px',
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
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: 0.45 },
          '50%': { transform: 'translateY(-18px) rotate(8deg)', opacity: 0.85 }
        },
        '@keyframes chelloPulseGlow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(56, 189, 248, 0.25)' },
          '50%': { boxShadow: '0 0 22px rgba(52, 211, 153, 0.45)' }
        },
        body: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(148, 163, 184, 0.6)',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(226, 232, 240, 0.95)'
          }
        }
      }
    }
  }
})

export default theme
