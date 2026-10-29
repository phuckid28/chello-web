import Box from '@mui/material/Box'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Avatar from '@mui/material/Avatar'
import { PRIMARY_THEMES_LIST } from '~/utils/animeTheme'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import {
  getDefaultTrackForTheme,
  isMusicBoxActive,
  playOstTrack,
  playUiChime
} from '~/utils/soundEffects'

function Workspaces() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const { globalPersonaKey, changePersona } = usePersonaTheme()
  const { tPrimary } = useTranslation()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelectPersona = (key) => {
    playUiChime('theme')
    changePersona(key)
    if (isMusicBoxActive()) {
      playOstTrack(getDefaultTrackForTheme(key))
    }
    handleClose()
  }

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Button
        sx={{
          color: 'white',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textTransform: 'none',
          px: 1.2
        }}
        id="basic-button-workspaces"
        aria-controls={open ? 'basic-menu-workspaces' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<AutoAwesomeIcon fontSize="small" sx={{ color: '#fde047' }} />}
        endIcon={<ExpandMoreIcon />}
      >
        {tPrimary('themeMenu')}
      </Button>
      <Menu
        id="basic-menu-workspaces"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-workspaces'
        }}
        PaperProps={{
          sx: { width: 350, maxWidth: '92vw', borderRadius: 2.5, p: 0.5 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.5 }} noWrap>
            {tPrimary('selectThemeTitle')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {tPrimary('selectThemeSub')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {PRIMARY_THEMES_LIST.map((persona) => {
          const isSelected = globalPersonaKey === persona.id
          return (
            <MenuItem
              key={persona.id}
              onClick={() => handleSelectPersona(persona.id)}
              selected={isSelected}
              sx={{
                borderRadius: 1.5,
                py: 1,
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                overflow: 'hidden'
              }}
            >
              <Avatar
                src={persona.heroImage}
                alt={persona.name}
                variant="rounded"
                sx={{ width: 42, height: 42, flexShrink: 0, border: `2px solid ${persona.accentColor}` }}
              />
              <ListItemText
                sx={{ minWidth: 0, flex: 1 }}
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {persona.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                    {persona.jpTitle}
                  </Typography>
                }
              />
              {isSelected && <CheckCircleIcon fontSize="small" sx={{ color: persona.accentColor, flexShrink: 0 }} />}
            </MenuItem>
          )
        })}
      </Menu>
    </Box>
  )
}

export default Workspaces
