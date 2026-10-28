import Box from '@mui/material/Box'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { ANIME_BOARD_TEMPLATES, savePersonaTheme } from '~/utils/animeTheme'
import { createNewBoardAPI } from '~/apis'
import { useNavigate } from 'react-router-dom'

function Templates() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [creating, setCreating] = useState(false)
  const open = Boolean(anchorEl)
  const navigate = useNavigate()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleCreateFromTemplate = async (tpl) => {
    if (creating) return
    setCreating(true)
    handleClose()
    try {
      savePersonaTheme(tpl.theme)
      const created = await createNewBoardAPI({
        title: tpl.title,
        description: tpl.description,
        type: 'public',
        theme: tpl.theme,
        useTemplate: true
      })
      if (created?._id) {
        navigate(`/boards/${created._id}`)
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <Box>
      <Button
        sx={{ color: 'white', fontWeight: 600 }}
        id="basic-button-templates"
        aria-controls={open ? 'basic-menu-templates' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Templates
      </Button>
      <Menu
        id="basic-menu-templates"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-templates'
        }}
        PaperProps={{
          sx: { width: 350, borderRadius: 2, p: 0.5 }
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoFixHighIcon fontSize="small" color="primary" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              1-CLICK ANIME TEMPLATES • テンプレート
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Create a ready-to-use board with columns & quests
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {ANIME_BOARD_TEMPLATES.map((tpl) => (
          <MenuItem
            key={tpl.id}
            disabled={creating}
            onClick={() => handleCreateFromTemplate(tpl)}
            sx={{ borderRadius: 1.5, py: 1.2, mb: 0.5, whiteSpace: 'normal' }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {tpl.title}
                  </Typography>
                  <Chip label={tpl.badge} size="small" sx={{ height: 20, fontSize: '11px', fontWeight: 700 }} />
                </Box>
              }
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {tpl.description}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default Templates
