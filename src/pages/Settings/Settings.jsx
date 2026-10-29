import { useEffect, useState } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import PersonIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'
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
  const [activeTab, setActiveTab] = useState(() => resolveTab(location.pathname))

  useEffect(() => {
    setActiveTab(resolveTab(location.pathname))
  }, [location.pathname])

  const handleChangeTab = (event, selectedTab) => {
    setActiveTab(selectedTab)
  }

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleChangeTab} aria-label="Settings tabs">
          <Tab
            label={t('tabAccount')}
            value={TABS.ACCOUNT}
            icon={<PersonIcon />}
            iconPosition="start"
            component={Link}
            to="/settings/account" />
          <Tab
            label={t('tabSecurity')}
            value={TABS.SECURITY}
            icon={<SecurityIcon />}
            iconPosition="start"
            component={Link}
            to="/settings/security" />
          <Tab
            label={t('tabAppearance')}
            value={TABS.APPEARANCE}
            icon={<AutoAwesomeRoundedIcon />}
            iconPosition="start"
            component={Link}
            to="/settings/appearance" />
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        {activeTab === TABS.ACCOUNT && <AccountTab />}
        {activeTab === TABS.SECURITY && <SecurityTab />}
        {activeTab === TABS.APPEARANCE && <FxSettingsPanel />}
      </Box>
    </Container>
  )
}

export default Settings
