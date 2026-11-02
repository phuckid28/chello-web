import { useEffect, useState } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import PersonIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import AccountTab from './AccountTab'
import SecurityTab from './SecurityTab'
import FxSettingsPanel from './FxSettingsPanel'

const TABS = {
  ACCOUNT: 'account',
  SECURITY: 'security',
  APPEARANCE: 'appearance'
}

const resolveTab = (pathname) => {
  if (pathname.includes(TABS.SECURITY)) return TABS.SECURITY
  if (pathname.includes(TABS.APPEARANCE)) return TABS.APPEARANCE
  return TABS.ACCOUNT
}

function Settings() {
  const location = useLocation()
  const { t } = useTranslation()
  const { themeConfig } = usePersonaTheme()
  const [activeTab, setActiveTab] = useState(() => resolveTab(location.pathname))

  useEffect(() => {
    setActiveTab(resolveTab(location.pathname))
  }, [location.pathname])

  const handleChangeTab = (event, selectedTab) => {
    setActiveTab(selectedTab)
  }

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
      <Box sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) => (theme.palette.mode === 'dark'
          ? 'var(--chella-raised-dark, #131c31)'
          : 'var(--chella-raised-light, #ffffff)')
      }}>
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
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Chella Workspace Settings
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

        <Box sx={{ maxWidth: '1080px', mx: 'auto', px: { xs: 1, md: 4 }, mt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={handleChangeTab}
            aria-label="Settings tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                minHeight: 48
              }
            }}
          >
            <Tab
              label={t('tabAccount')}
              value={TABS.ACCOUNT}
              icon={<PersonIcon fontSize="small" />}
              iconPosition="start"
              component={Link}
              to="/settings/account"
            />
            <Tab
              label={t('tabSecurity')}
              value={TABS.SECURITY}
              icon={<SecurityIcon fontSize="small" />}
              iconPosition="start"
              component={Link}
              to="/settings/security"
            />
            <Tab
              label={t('tabAppearance')}
              value={TABS.APPEARANCE}
              icon={<AutoAwesomeRoundedIcon fontSize="small" />}
              iconPosition="start"
              component={Link}
              to="/settings/appearance"
            />
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ maxWidth: '1080px', mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        {activeTab === TABS.ACCOUNT && <AccountTab />}
        {activeTab === TABS.SECURITY && <SecurityTab />}
        {activeTab === TABS.APPEARANCE && <FxSettingsPanel />}
      </Box>
    </Container>
  )
}

export default Settings
