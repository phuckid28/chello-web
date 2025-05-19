import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'


function Card({ temporaryHideMedia }) {
  if (temporaryHideMedia) {
    return (
      <MuiCard sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow: 'unset'
      }}>

        <CardContent sx={{ p: '1.5', '&:last-child': { p: '1.5' } }}>
          <Typography>
          Card test 01
          </Typography>
        </CardContent>

      </MuiCard>
    )
  }
  return (
    <MuiCard sx={{
      cursor: 'pointer',
      boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
      overflow: 'unset'
    }}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image="src\assets\banner.jpg"
      />
      <CardContent sx={{ p: '1.5', '&:last-child': { p: '1.5' } }}>
        <Typography>
          Phuckid28
        </Typography>
      </CardContent>
      <CardActions sx={{ p: '0 4px 8px 4px ' }}>
        <Button size="small" startIcon={<GroupIcon />}> 10</Button>
        <Button size="small" startIcon={<CommentIcon />}> 727</Button>
        <Button size="small" startIcon={<AttachmentIcon />}> 135</Button>
      </CardActions>
    </MuiCard>
  )
}

export default Card