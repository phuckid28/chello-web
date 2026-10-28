import { useState } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import LabelImportantOutlinedIcon from '@mui/icons-material/LabelImportantOutlined'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'

import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import { styled } from '@mui/material/styles'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  selectIsShowModalActiveCard,
  updateCurrentActiveCard
} from '~/redux/activeCard/activeCardSlice'
import { deleteCardDetailsAPI, updateCardDetailsAPI } from '~/apis'
import {
  selectCurrentActiveBoard,
  updateCardInBoard,
  updateCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import { ELEMENTAL_LABELS, resolveCardCoverUrl } from '~/utils/animeTheme'
import { useConfirm } from 'material-ui-confirm'
import { cloneDeep } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import { toast } from 'react-toastify'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

function ActiveCard() {
  const dispatch = useDispatch()
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentUser = useSelector(selectCurrentUser)
  const board = useSelector(selectCurrentActiveBoard)
  const confirmDeleteCard = useConfirm()

  const [showCoverInput, setShowCoverInput] = useState(false)
  const [coverUrlInput, setCoverUrlInput] = useState('')
  const [newQuestTitle, setNewQuestTitle] = useState('')

  const handleCloseModal = () => {
    setShowCoverInput(false)
    dispatch(clearAndHideCurrentActiveCard())
  }

  const callApiUpdateCard = async (updateData) => {
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)
    dispatch(updateCurrentActiveCard(updatedCard))
    dispatch(updateCardInBoard(updatedCard))
    return updatedCard
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUpdateCardCover = (presetOrUrl) => {
    const finalCover = presetOrUrl !== undefined ? presetOrUrl : (coverUrlInput.trim() || null)
    callApiUpdateCard({ cover: finalCover }).then(() => {
      setShowCoverInput(false)
      setCoverUrlInput('')
    })
  }

  const onToggleElementalLabel = (labelObj) => {
    const currentLabels = activeCard?.labels || []
    const exists = currentLabels.some(l => l.id === labelObj.id)
    const nextLabels = exists
      ? currentLabels.filter(l => l.id !== labelObj.id)
      : [...currentLabels, labelObj]
    callApiUpdateCard({ labels: nextLabels })
  }

  const onAddChecklistItem = () => {
    if (!newQuestTitle.trim()) return
    const currentChecklist = activeCard?.checklist || []
    const nextItem = {
      id: `quest-${Date.now()}`,
      title: newQuestTitle.trim(),
      isCompleted: false
    }
    callApiUpdateCard({ checklist: [...currentChecklist, nextItem] }).then(() => {
      setNewQuestTitle('')
    })
  }

  const onToggleChecklistItem = (itemId) => {
    const currentChecklist = activeCard?.checklist || []
    const nextChecklist = currentChecklist.map(item => (
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    ))
    callApiUpdateCard({ checklist: nextChecklist })
  }

  const onDeleteChecklistItem = (itemId) => {
    const currentChecklist = activeCard?.checklist || []
    const nextChecklist = currentChecklist.filter(item => item.id !== itemId)
    callApiUpdateCard({ checklist: nextChecklist })
  }

  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo })
  }

  const handleDeleteCard = () => {
    confirmDeleteCard({
      title: 'Delete this card?',
      description: 'This action will permanently delete this card. Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      const cardId = activeCard._id
      const columnId = activeCard.columnId
      handleCloseModal()

      const newBoard = cloneDeep(board)
      const targetColumn = newBoard.columns.find(c => c._id === columnId)
      if (targetColumn) {
        targetColumn.cards = targetColumn.cards.filter(c => c._id !== cardId)
        targetColumn.cardOrderIds = targetColumn.cardOrderIds.filter(id => id !== cardId)
        if (targetColumn.cards.length === 0) {
          const placeholderCard = generatePlaceholderCard(targetColumn)
          targetColumn.cards = [placeholderCard]
          targetColumn.cardOrderIds = [placeholderCard._id]
        }
      }
      dispatch(updateCurrentActiveBoard(newBoard))

      deleteCardDetailsAPI(cardId).then(res => {
        toast.success(res?.deleteResult || 'Card deleted successfully')
      })
    }).catch(() => {})
  }

  const resolvedCover = resolveCardCoverUrl(activeCard?.cover)
  const checklist = activeCard?.checklist || []
  const completedCount = checklist.filter(i => i.isCompleted).length
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 920,
        maxWidth: '95vw',
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '14px',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        outline: 0,
        padding: '40px 24px 24px',
        margin: '40px auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#fff'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
        </Box>

        {resolvedCover &&
          <Box sx={{ mb: 4 }}>
            <img
              style={{ width: '100%', height: '280px', borderRadius: '10px', objectFit: 'cover' }}
              src={resolvedCover}
              alt="card-cover"
            />
          </Box>
        }

        <Box sx={{ mb: 2, mt: -2, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon color="primary" />
          <ToggleFocusInput
            inputFontSize='22px'
            value={activeCard?.title || ''}
            onChangedValue={onUpdateCardTitle} />
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          <Grid xs={12} sm={8.5}>
            {/* Elemental Labels Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LabelImportantOutlinedIcon fontSize="small" color="primary" />
                <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '15px' }}>
                  Elemental Tags • 元素タグ
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {ELEMENTAL_LABELS.map((lbl) => {
                  const isSelected = activeCard?.labels?.some(l => l.id === lbl.id)
                  return (
                    <Chip
                      key={lbl.id}
                      label={lbl.title}
                      size="small"
                      onClick={() => onToggleElementalLabel(lbl)}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: 'white',
                        bgcolor: lbl.color,
                        opacity: isSelected ? 1 : 0.35,
                        border: isSelected ? '2px solid #fde047' : '2px solid transparent',
                        transform: isSelected ? 'scale(1.03)' : 'none'
                      }}
                    />
                  )
                })}
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1, fontSize: '15px' }}>
                Party Members • メンバー
              </Typography>
              <CardUserGroup
                cardMemberIds={activeCard?.memberIds}
                onUpdateCardMembers={onUpdateCardMembers}
              />
            </Box>

            {/* Quest Objectives / Checklist Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FactCheckOutlinedIcon color="primary" />
                  <Typography variant="span" sx={{ fontWeight: 700, fontSize: '18px' }}>
                    Quest Objectives • 任務目標 ({completedCount}/{checklist.length})
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {progressPercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
              />

              <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                {checklist.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1.5,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={Boolean(item.isCompleted)}
                        onChange={() => onToggleChecklistItem(item.id)}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: item.isCompleted ? 'line-through' : 'none',
                          color: item.isCompleted ? 'text.secondary' : 'text.primary',
                          fontWeight: 500
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    <IconButton size="small" color="error" onClick={() => onDeleteChecklistItem(item.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add a new quest objective..."
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      onAddChecklistItem()
                    }
                  }}
                />
                <Button variant="contained" size="small" onClick={onAddChecklistItem}>
                  Add
                </Button>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon color="primary" />
                <Typography variant="span" sx={{ fontWeight: 700, fontSize: '18px' }}>
                  Description • 詳細
                </Typography>
              </Box>
              <CardDescriptionMdEditor
                cardDescriptionProp={activeCard?.description}
                handleUpdateCardDescription={onUpdateCardDescription}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon color="primary" />
                <Typography variant="span" sx={{ fontWeight: 700, fontSize: '18px' }}>
                  Akasha Activity Log • コメント
                </Typography>
              </Box>
              <CardActivitySection
                cardComments={activeCard?.comments}
                onAddCardComment={onAddCardComment}
              />
            </Box>
          </Grid>

          <Grid xs={12} sm={3.5}>
            <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              Quick Actions • 操作
            </Typography>
            <Stack direction="column" spacing={1}>
              {currentUser?._id && !activeCard?.memberIds?.includes(currentUser._id) &&
                <SidebarItem
                  className="active"
                  onClick={() => onUpdateCardMembers({
                    userId: currentUser._id,
                    action: CARD_MEMBER_ACTIONS.ADD
                  })}
                >
                  <PersonOutlineOutlinedIcon fontSize="small" />
                  <span>Join Party</span>
                </SidebarItem>
              }
              <SidebarItem
                className="active"
                onClick={() => {
                  setCoverUrlInput(activeCard?.cover || '')
                  setShowCoverInput(!showCoverInput)
                }}
              >
                <ImageOutlinedIcon fontSize="small" />
                <span>Anime Cover Art</span>
              </SidebarItem>

              {showCoverInput &&
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.25, border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    1-Click Archon Covers:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip
                      label="💧 Furina Stage"
                      size="small"
                      color="primary"
                      onClick={() => onUpdateCardCover('preset:furina')}
                      clickable
                    />
                    <Chip
                      label="🌿 Nahida Irminsul"
                      size="small"
                      color="success"
                      onClick={() => onUpdateCardCover('preset:nahida')}
                      clickable
                    />
                    {activeCard?.cover && (
                      <Chip
                        label="Remove"
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => onUpdateCardCover(null)}
                        clickable
                      />
                    )}
                  </Box>
                  <TextField
                    size="small"
                    label="Or custom https:// image URL..."
                    value={coverUrlInput}
                    onChange={(e) => setCoverUrlInput(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button size="small" variant="contained" color="info" onClick={() => onUpdateCardCover()}>
                      Save URL
                    </Button>
                  </Box>
                </Box>
              }
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Danger Zone</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem
                onClick={handleDeleteCard}
                sx={{ color: 'error.main', '&:hover': { color: 'error.dark' } }}
              >
                <DeleteOutlineIcon fontSize="small" />
                <span>Delete Card</span>
              </SidebarItem>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default ActiveCard
