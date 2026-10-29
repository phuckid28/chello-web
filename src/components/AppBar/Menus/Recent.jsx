import Box from '@mui/material/Box'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import { fetchBoardsAPI } from '~/apis'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'

function Recent() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [recentBoards, setRecentBoards] = useState([])
  const open = Boolean(anchorEl)
  const navigate = useNavigate()
  const { tPrimary } = useTranslation()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
    fetchBoardsAPI().then(res => {
      setRecentBoards((res?.boards || []).slice(0, 6))
    }).catch(() => {})
  }

  const handleClose = () => {
    setAnchorEl(null)
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
        id="basic-button-recent"
        aria-controls={open ? 'basic-menu-recent' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        {tPrimary('recentMenu')}
      </Button>
      <Menu
        id="basic-menu-recent"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-recent'
        }}
        PaperProps={{
          sx: { width: 310, maxWidth: '92vw', borderRadius: 2.5, p: 0.5, overflow: 'hidden' }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
            {tPrimary('recentBoardsTitle')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {recentBoards.length === 0 && (
          <MenuItem disabled>
            <Typography variant="caption">{tPrimary('noBoardsFound')}</Typography>
          </MenuItem>
        )}
        {recentBoards.map(board => (
          <MenuItem
            key={board._id}
            onClick={() => {
              handleClose()
              navigate(`/boards/${board._id}`)
            }}
            sx={{ borderRadius: 1.5, overflow: 'hidden', gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 'unset !important', flexShrink: 0 }}>
              <SpaceDashboardRoundedIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}
              primary={
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {board.title}
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  sx={{ display: 'block', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {board.description}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default Recent
