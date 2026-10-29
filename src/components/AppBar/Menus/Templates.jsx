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
import { useTranslation } from '~/customHooks/useTranslation'

function Templates() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [creating, setCreating] = useState(false)
  const open = Boolean(anchorEl)
  const navigate = useNavigate()
  const { tPrimary } = useTranslation()

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
    <Box sx={{ flexShrink: 0 }}>
      <Button
        sx={{
          color: 'white',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textTransform: 'none',
          px: 1.2
        }}
        id="basic-button-templates"
        aria-controls={open ? 'basic-menu-templates' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        {tPrimary('templatesMenu')}
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
          sx: { width: 370, maxWidth: '92vw', borderRadius: 2.5, p: 0.5, overflow: 'hidden' }
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoFixHighIcon fontSize="small" color="primary" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
              {tPrimary('templatesTitle')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
              {tPrimary('templatesSub')}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {ANIME_BOARD_TEMPLATES.map((tpl) => (
          <MenuItem
            key={tpl.id}
            disabled={creating}
            onClick={() => handleCreateFromTemplate(tpl)}
            sx={{ borderRadius: 1.5, py: 1.1, mb: 0.5, whiteSpace: 'normal', overflow: 'hidden' }}
          >
            <ListItemText
              sx={{ minWidth: 0, width: '100%' }}
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {tpl.title}
                  </Typography>
                  <Chip label={tpl.badge} size="small" sx={{ height: 20, fontSize: '10px', fontWeight: 700, flexShrink: 0 }} />
                </Box>
              }
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.35 }}>
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
