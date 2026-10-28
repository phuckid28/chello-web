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

function Recent() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [recentBoards, setRecentBoards] = useState([])
  const open = Boolean(anchorEl)
  const navigate = useNavigate()

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
    <Box>
      <Button
        sx={{ color: 'white', fontWeight: 600 }}
        id="basic-button-recent"
        aria-controls={open ? 'basic-menu-recent' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Recent
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
          sx: { width: 280, borderRadius: 2, p: 0.5 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            RECENT BOARDS • 最近のボード
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {recentBoards.length === 0 && (
          <MenuItem disabled>
            <Typography variant="caption">No boards found.</Typography>
          </MenuItem>
        )}
        {recentBoards.map(board => (
          <MenuItem
            key={board._id}
            onClick={() => {
              handleClose()
              navigate(`/boards/${board._id}`)
            }}
            sx={{ borderRadius: 1.5 }}
          >
            <ListItemIcon>
              <SpaceDashboardRoundedIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant="body2" sx={{ fontWeight: 700 }}>{board.title}</Typography>}
              secondary={<Typography variant="caption" noWrap>{board.description}</Typography>}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default Recent
