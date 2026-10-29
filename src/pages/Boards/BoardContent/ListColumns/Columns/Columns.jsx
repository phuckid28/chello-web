import Box from '@mui/material/Box'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'react-toastify'
import { useConfirm } from 'material-ui-confirm'

import { createNewCardAPI, deleteColumnDetailsAPI, updateColumnDetailsAPI } from '~/apis'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { cloneDeep } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import { SoraBunnyIcon } from '~/components/Icons/SoraBunnyIcon'
import { useTranslation } from '~/customHooks/useTranslation'

function Columns({ column }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const { tPrimary } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })

  const dndKitColumnStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const orderedCards = column.cards
  const realCardCount = (orderedCards || []).filter(c => !c.FE_PlaceholderCard).length

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardTitle, setNewCardTitle] = useState('')
  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error(tPrimary('pleaseEnterCrTitleToast'), { position: 'bottom-right' })
      return
    }
    const prefix = (column?.title || 'CR').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) || 'CR'
    // Use the full board (not the filtered view) and the highest existing number to avoid duplicate Ticket IDs
    const codePattern = new RegExp(`^${prefix}-(\\d+)$`, 'i')
    const usedNumbers = (board?.columns || [])
      .flatMap(c => c.cards || [])
      .map(c => Number(String(c.crCode || '').match(codePattern)?.[1]))
      .filter(n => Number.isFinite(n))
    const nextIndex = Math.max(realCardCount, ...usedNumbers, 0) + 1
    const newCardData = {
      title: newCardTitle,
      columnId: column._id,
      crCode: `${prefix}-${nextIndex}`,
      baStatus: 'Processing'
    }

    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })

    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(c => c._id === createdCard.columnId)
    if (columnToUpdate) {
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    dispatch(updateCurrentActiveBoard(newBoard))

    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  const confirmDeleteColumn = useConfirm()
  const handleDeleteColumn = () => {
    confirmDeleteColumn({
      title: tPrimary('deleteColumnTitle'),
      description: tPrimary('deleteColumnDesc'),
      confirmationText: tPrimary('confirmBtn'),
      cancellationText: tPrimary('cancelBtn')
    }).then(() => {
      const newBoard = { ...board }
      newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
      newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
      dispatch(updateCurrentActiveBoard(newBoard))

      deleteColumnDetailsAPI(column._id).then(res => {
        toast.success(res?.deleteResult)
      })
    }).catch(() => {})
  }

  const onUpdateColumnTitle = (newTitle) => {
    updateColumnDetailsAPI(column._id, { title: newTitle }).then(() => {
      const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(c => column._id === c._id)
      if (columnToUpdate) {
        columnToUpdate.title = newTitle
      }
      dispatch(updateCurrentActiveBoard(newBoard))
    })
  }

  return (
    <div ref={setNodeRef} style={dndKitColumnStyle} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '308px',
          maxWidth: '308px',
          overflow: 'hidden',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.86)' : 'rgba(248, 250, 252, 0.92)'),
          backdropFilter: 'blur(18px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.24)',
          boxShadow: '0 10px 34px rgba(0, 0, 0, 0.24)',
          ml: 2,
          borderRadius: '14px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          animation: 'chelloFadeSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          transition: 'border-color 0.22s ease, box-shadow 0.22s ease',
          '&:hover': {
            borderColor: 'rgba(125, 211, 252, 0.5)',
            boxShadow: '0 14px 38px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <Box sx={{
          height: '3px',
          width: '100%',
          background: 'linear-gradient(90deg, #7dd3fc 0%, #f472b6 50%, #a78bfa 100%)'
        }} />

        {/* Column Header (Each Column = 1 CR Topic) */}
        <Box sx={{
          height: (theme) => theme.trello.columnHeaderHeight,
          px: 1.75,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 0.75,
          overflow: 'hidden'
        }}>
          <SoraBunnyIcon sx={{ fontSize: 18, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <ToggleFocusInput
              value={column?.title}
              onChangedValue={onUpdateColumnTitle}
              data-no-dnd="true"
            />
          </Box>
          <Chip
            label={realCardCount}
            size="small"
            sx={{
              height: 20,
              minWidth: 24,
              flexShrink: 0,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(125, 211, 252, 0.16)' : 'rgba(2, 132, 199, 0.12)'),
              color: 'primary.main'
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Tooltip title={tPrimary('moreOptionsTooltip')}>
              <ExpandMoreIcon
                sx={{ color: 'text.primary', cursor: 'pointer' }}
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown'
              }}
            >
              <MenuItem
                onClick={toggleOpenNewCardForm}
                sx={{
                  '&:hover': {
                    color: 'success.light',
                    '& .add-card-icon': { color: 'success.light' }
                  }
                }}
              >
                <ListItemIcon><AddCardIcon className='add-card-icon' fontSize="small" /></ListItemIcon>
                <ListItemText>{tPrimary('addNewCrCard')}</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
                <ListItemText>{tPrimary('cutMenu')}</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
                <ListItemText>{tPrimary('copyMenu')}</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
                <ListItemText>{tPrimary('pasteMenu')}</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleDeleteColumn}
                sx={{
                  '&:hover': {
                    color: 'warning.dark',
                    '& .delete-forever-icon': { color: 'warning.dark' }
                  }
                }}
              >
                <ListItemIcon><DeleteForeverIcon className='delete-forever-icon' fontSize="small" /></ListItemIcon>
                <ListItemText>{tPrimary('deleteTopicColumnMenu')}</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>{tPrimary('archiveTopicColumnMenu')}</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Box column list card */}
        <ListCards cards={orderedCards} />

        {/* Box column footer */}
        <Box sx={{
          height: (theme) => theme.trello.columnFooterHeight,
          px: 1.75,
          py: 1.25,
          overflow: 'hidden'
        }}>
          {!openNewCardForm
            ? <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1
            }}>
              <Button
                size="small"
                startIcon={<AddCardIcon />}
                onClick={toggleOpenNewCardForm}
                sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {tPrimary('addNewCrCard')}
              </Button>
              <Tooltip title='Drag to move topic'>
                <DragHandleIcon sx={{ cursor: 'pointer', flexShrink: 0 }} />
              </Tooltip>
            </Box>
            : <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75
            }}>
              <TextField
                label={tPrimary('enterCrTitle')}
                type="text"
                size='small'
                variant='outlined'
                autoFocus
                data-no-dnd="true"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addNewCard()
                  }
                }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  '& label': { color: 'text.primary' },
                  '& input': {
                    color: (theme) => theme.palette.primary.main,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                  },
                  '& label.Mui-focused': { color: (theme) => theme.palette.primary.main },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: (theme) => theme.palette.primary.main },
                    '&:hover fieldset': { borderColor: (theme) => theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: (theme) => theme.palette.primary.main }
                  },
                  '& .MuiOutlinedInput-input': {
                    borderRadius: 1
                  }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Button
                  className='interceptor-loading'
                  onClick={addNewCard}
                  variant='contained' color='success' size='small'
                  data-no-dnd="true"
                  sx={{
                    minWidth: 'unset',
                    px: 1.25,
                    textTransform: 'none',
                    fontWeight: 700,
                    boxShadow: 'none'
                  }}
                >
                  {tPrimary('addBtn')}
                </Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: 'pointer'
                  }}
                  onClick={toggleOpenNewCardForm}
                />
              </Box>
            </Box>
          }
        </Box>
      </Box>
    </div>
  )
}

export default Columns
