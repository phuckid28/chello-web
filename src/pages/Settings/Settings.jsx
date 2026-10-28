import { useEffect, useState } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import PersonIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import { Link, useLocation } from 'react-router-dom'
import AccountTab from './AccountTab'
import SecurityTab from './SecurityTab'

const TABS = {
  ACCOUNT: 'account',
  SECURITY: 'security'
}

function Settings() {
  const location = useLocation()

  const getDefaultTab = () => {
    if (location.pathname.includes(TABS.SECURITY)) return TABS.SECURITY
    return TABS.ACCOUNT
  }
  const [activeTab, setActiveTab] = useState(getDefaultTab())

  useEffect(() => {
    setActiveTab(location.pathname.includes(TABS.SECURITY) ? TABS.SECURITY : TABS.ACCOUNT)
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
            label="Account"
            value={TABS.ACCOUNT}
            icon={<PersonIcon />}
            iconPosition="start"
            component={Link}
            to="/settings/account" />
          <Tab
            label="Security"
            value={TABS.SECURITY}
            icon={<SecurityIcon />}
            iconPosition="start"
            component={Link}
            to="/settings/security" />
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        {activeTab === TABS.ACCOUNT && <AccountTab />}
        {activeTab === TABS.SECURITY && <SecurityTab />}
      </Box>
    </Container>
  )
}

export default Settings
