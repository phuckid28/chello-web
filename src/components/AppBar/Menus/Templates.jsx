import Box from '@mui/material/Box'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { DEFAULT_SPRINT_TEMPLATE } from '~/utils/animeTheme'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'

function Templates() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const navigate = useNavigate()
  const location = useLocation()
  const { themeConfig } = usePersonaTheme()
  const { tPrimary } = useTranslation()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleOpenUnifiedSprintCreate = () => {
    handleClose()
    if (location.pathname === '/boards') {
      window.dispatchEvent(new CustomEvent('chello-open-create-board-modal'))
    } else {
      navigate('/boards?create=1')
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
          sx: { width: 390, maxWidth: '92vw', borderRadius: 2.5, p: 1, overflow: 'hidden' }
        }}
      >
        <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <ViewKanbanRoundedIcon fontSize="small" sx={{ color: themeConfig.accentColor }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                MẪU SPRINT TIÊU CHUẨN DUY NHẤT
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                Tất cả các Board / Sprint đều chung 1 kiểu template
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Unified"
            size="small"
            sx={{ height: 20, fontSize: '10px', fontWeight: 800, color: '#0f172a', bgcolor: themeConfig.accentColor }}
          />
        </Box>
        <Divider sx={{ my: 0.75 }} />

        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>
            {DEFAULT_SPRINT_TEMPLATE.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25, lineHeight: 1.45 }}>
            {DEFAULT_SPRINT_TEMPLATE.description}
          </Typography>

          <Stack spacing={0.6} sx={{ mb: 1.5 }}>
            {DEFAULT_SPRINT_TEMPLATE.modules.map((mod) => (
              <Box key={mod} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 14, color: themeConfig.accentColor, mt: 0.2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
                  {mod}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<LibraryAddIcon fontSize="small" />}
            onClick={handleOpenUnifiedSprintCreate}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '9px',
              color: '#0f172a',
              bgcolor: themeConfig.accentColor,
              '&:hover': { bgcolor: themeConfig.accentColor, opacity: 0.92 }
            }}
          >
            {tPrimary('createNewSprintBoard')}
          </Button>
        </Box>
      </Menu>
    </Box>
  )
}

export default Templates
