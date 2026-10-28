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
import { ANIME_THEMES } from '~/utils/animeTheme'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'

function Workspaces() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const { globalPersonaKey, changePersona } = usePersonaTheme()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelectPersona = (key) => {
    changePersona(key)
    handleClose()
  }

  return (
    <Box>
      <Button
        sx={{ color: 'white', fontWeight: 600 }}
        id="basic-button-workspaces"
        aria-controls={open ? 'basic-menu-workspaces' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<AutoAwesomeIcon fontSize="small" sx={{ color: '#fde047' }} />}
        endIcon={<ExpandMoreIcon />}
      >
        Archon Realm
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
          sx: { width: 340, borderRadius: 2, p: 0.5 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
            SELECT ARCHON PERSONA • 領域選択
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Transform Chello’s atmosphere with Furina or Nahida
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {Object.values(ANIME_THEMES).map((persona) => {
          const isSelected = globalPersonaKey === persona.id
          return (
            <MenuItem
              key={persona.id}
              onClick={() => handleSelectPersona(persona.id)}
              selected={isSelected}
              sx={{ borderRadius: 1.5, py: 1.2, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}
            >
              <Avatar
                src={persona.heroImage}
                alt={persona.name}
                variant="rounded"
                sx={{ width: 44, height: 44, border: `2px solid ${persona.accentColor}` }}
              />
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {persona.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {persona.jpTitle}
                  </Typography>
                }
              />
              {isSelected && <CheckCircleIcon fontSize="small" sx={{ color: persona.accentColor }} />}
            </MenuItem>
          )
        })}
      </Menu>
    </Box>
  )
}

export default Workspaces
