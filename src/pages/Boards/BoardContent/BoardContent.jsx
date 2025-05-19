import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sort'


function BoardContent({ board }) {
  const orderredColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
  return (
    <Box sx={{
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      width: '100%',
      height: (theme) => theme.trello.boardContentHeight,
      display: 'flex',
      p: '10px 0'
    }}>
      <ListColumns columns={orderredColumns} />
    </Box>
  )
}

export default BoardContent