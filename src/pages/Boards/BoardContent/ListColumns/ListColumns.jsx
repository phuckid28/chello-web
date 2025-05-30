import Box from '@mui/material/Box'
import Columns from './Columns/Columns'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { toast } from 'react-toastify'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

function ListColumns({ columns, createNewColumn, createNewCard }) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')
  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please enter title')
      return
    }
    // Tạo dữ liệu Column để gọi API
    const newColumnData = {
      title: newColumnTitle

    }

    // Gọi lên props function createNewColumn nằm ở component cha cao nhất (boards/_id.jsx)
    // Có thể sử dụng redux để đưa dữ liệu ra ngoài để có thể gọi luôn API thay vì lần lượt gọi ngược lên những component cha phía trên
    await createNewColumn(newColumnData)

    // Đóng trạng thái thêm Column mới và clear input
    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }
  /**
 * SortableContext yêu cầu items là 1 mảng dạng ['id-1', 'id-2'] chứ không phải [{id: 'id-1}, {id: 'id-2'}]
 * Nếu ko đúng thì vẫn kéo thả dc nhg ko có animation
 * https://github.com/clauderic/dnd-kit/issues183#issuecomment-812569512
 */

  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {/* Tim hieu ve truyen du lieu xuong */}
        {columns?.map(column => <Columns key={column._id} column={column} createNewCard={createNewCard}/>)}


        {/* Box add new column */}
        {!openNewColumnForm
          ? <Box onClick = {toggleOpenNewColumnForm} sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button
              startIcon={<NoteAddIcon />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
            >
              Add new column
            </Button>
          </Box>
          : <Box sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
          >
            <TextField
              label="Enter column title..."
              type="text"
              size='small'
              variant='outlined'
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}

              sx={{
                '& label': { color: 'white' },
                '& input': { color: 'white' },
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
            />
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Button
                onClick={addNewColumn}
                variant='contained' color='success' size='small'
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                }}
              >Add Column</Button>
              <CloseIcon
                fontSize='small'
                sx={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover' : { color: (theme) => theme.palette.warning.main }
                }}
                onClick={toggleOpenNewColumnForm}

              />
            </Box>
          </Box>
        }

      </Box>
    </SortableContext>
  )
}

export default ListColumns