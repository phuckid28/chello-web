import AppBar from '~/components/AppBar/AppBar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import PersonIcon from '@mui/icons-material/Person'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import SecurityIcon from '@mui/icons-material/Security'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import AccountTab from './AccountTab'
import SecurityTab from './SecurityTab'
import ProfileTab from './profile/ProfileTab'
import SessionsTab from './tabs/SessionsTab'
import NotificationsTab from './tabs/NotificationsTab'
import PrivacyTab from './tabs/PrivacyTab'
import AppearanceTab from './tabs/AppearanceTab'
import DataTab from './tabs/DataTab'
import { SETTINGS_TAB_KEYS, TAB_LABEL_KEYS, resolveSettingsTab } from './utils/tabs'

const TAB_VIEWS = {
  account: { icon: PersonIcon, Component: AccountTab },
  profile: { icon: BadgeOutlinedIcon, Component: ProfileTab },
  security: { icon: SecurityIcon, Component: SecurityTab },
  sessions: { icon: DevicesOutlinedIcon, Component: SessionsTab },
  notifications: { icon: NotificationsNoneOutlinedIcon, Component: NotificationsTab },
  privacy: { icon: VisibilityOutlinedIcon, Component: PrivacyTab },
  appearance: { icon: AutoAwesomeRoundedIcon, Component: AppearanceTab },
  data: { icon: StorageOutlinedIcon, Component: DataTab }
}

const raisedBg = (theme) => (theme.palette.mode === 'dark'
  ? 'var(--chella-raised-dark, #131c31)'
  : 'var(--chella-raised-light, #ffffff)')

function Settings() {
  const location = useLocation()
  const { t } = useTranslation()
  const { themeConfig } = usePersonaTheme()
  // The URL is the single source of truth for the active tab (deep links + back/forward)
  const activeTab = resolveSettingsTab(location.pathname)
  const ActiveComponent = TAB_VIEWS[activeTab].Component

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => (theme.palette.mode === 'dark'
          ? 'var(--chella-ground-dark, #0b1120)'
          : 'var(--chella-ground-light, #f8fafc)')
      }}
    >
      <AppBar />
      <Box sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: raisedBg }}>
        <Box sx={{
          maxWidth: '1080px',
          mx: 'auto',
          px: { xs: 2, md: 4 },
          pt: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5
        }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t('setPageTitle')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {themeConfig.name}
            </Typography>
          </Box>
          {themeConfig.archetypeLabel && (
            <Chip
              size="small"
              label={themeConfig.archetypeLabel}
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                color: themeConfig.accentColor,
                bgcolor: themeConfig.badgeBg,
                border: `1px solid ${themeConfig.columnBorder}`
              }}
            />
          )}
        </Box>

        <Box sx={{ maxWidth: '1080px', mx: 'auto', px: { xs: 0, md: 4 }, mt: 1 }}>
          <Tabs
            value={activeTab}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label={t('setTabsAria')}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                minHeight: 48,
                minWidth: 'auto',
                px: { xs: 1.5, md: 2 }
              }
            }}
          >
            {SETTINGS_TAB_KEYS.map((key) => {
              const Icon = TAB_VIEWS[key].icon
              return (
                <Tab
                  key={key}
                  label={t(TAB_LABEL_KEYS[key])}
                  value={key}
                  icon={<Icon fontSize="small" />}
                  iconPosition="start"
                  component={Link}
                  to={`/settings/${key}`}
                />
              )
            })}
          </Tabs>
        </Box>
      </Box>

      <Box component="main" sx={{ maxWidth: '1080px', mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <ActiveComponent />
      </Box>
    </Container>
  )
}

export default Settings
