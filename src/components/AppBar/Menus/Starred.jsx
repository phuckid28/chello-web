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
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { fetchBoardsAPI } from '~/apis'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '~/customHooks/useTranslation'

function Starred() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [starredBoards, setStarredBoards] = useState([])
  const open = Boolean(anchorEl)
  const navigate = useNavigate()
  const { tPrimary } = useTranslation()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
    fetchBoardsAPI().then(res => {
      const boards = res?.boards || []
      setStarredBoards(boards.filter(b => b.isStarred))
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
        id="basic-button-starred"
        aria-controls={open ? 'basic-menu-starred' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        {tPrimary('starredMenu')}
      </Button>
      <Menu
        id="basic-menu-starred"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-starred'
        }}
        PaperProps={{
          sx: { width: 310, maxWidth: '92vw', borderRadius: 2.5, p: 0.5, overflow: 'hidden' }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
            {tPrimary('starredBoardsTitle')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {starredBoards.length === 0 && (
          <MenuItem disabled sx={{ whiteSpace: 'normal' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {tPrimary('noStarredBoards')}
            </Typography>
          </MenuItem>
        )}
        {starredBoards.map(board => (
          <MenuItem
            key={board._id}
            onClick={() => {
              handleClose()
              navigate(`/boards/${board._id}`)
            }}
            sx={{ borderRadius: 1.5, overflow: 'hidden', gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 'unset !important', flexShrink: 0 }}>
              <StarRoundedIcon fontSize="small" sx={{ color: '#fbbf24' }} />
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

export default Starred
