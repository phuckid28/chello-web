import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
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
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
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
import { useNavigate } from 'react-router-dom'
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
import { ELEMENTAL_LABELS, SORA_PRESET_COVERS, resolveCardCoverUrl } from '~/utils/animeTheme'
import {
  BA_STATUS_OPTIONS,
  DEFAULT_SPRINT_CONFIG,
  GENERATE_BA_FRD_TEMPLATE,
  collectBoardCardsWithColumn,
  exportCardAsFrdMarkdown,
  getDeadlineStatus,
  getSavedTeamRoster,
  saveTeamRoster
} from '~/utils/excelExporter'
import { snapProgress } from '~/utils/progress'
import ProgressSelect from '~/components/Modal/ProgressSelect'
import LoadingButton from '~/components/Loading/LoadingButton'
import { fxCelebrate } from '~/fx/fxEvents'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { playUiChime } from '~/utils/soundEffects'
import { useConfirm } from 'material-ui-confirm'
import { cloneDeep } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import { toast } from 'react-toastify'
import { useTranslation } from '~/customHooks/useTranslation'
import { DEFAULT_PRIORITY, PRIORITY_OPTIONS, normalizePriority } from '~/utils/crMeta'
import CrAssistantPanel from './CrAssistantPanel'
import GoogleDriveFrdControls from './GoogleDriveFrdControls'

// Converts a timestamp / ISO string into the YYYY-MM-DD value expected by <input type="date">
const toDateInputValue = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

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
  const navigate = useNavigate()
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard)
  const currentUser = useSelector(selectCurrentUser)
  const board = useSelector(selectCurrentActiveBoard)
  const confirmDeleteCard = useConfirm()
  const { t, tPrimary, formatMessage } = useTranslation()

  const defaultSprint = board?.sprintConfig?.name || DEFAULT_SPRINT_CONFIG.name

  const [showCoverInput, setShowCoverInput] = useState(false)
  const [coverUrlInput, setCoverUrlInput] = useState('')
  const [newQuestTitle, setNewQuestTitle] = useState('')
  const [newRosterMemberName, setNewRosterMemberName] = useState('')
  const [teamRoster, setTeamRoster] = useState(() => getSavedTeamRoster(board))

  // CR Metadata local form states matching Sprint 34 Excel Template
  const [crCode, setCrCode] = useState('')
  const [sprint, setSprint] = useState(defaultSprint)
  const [assignee, setAssignee] = useState('')
  const [baStatus, setBaStatus] = useState('Processing')
  const [deadline, setDeadline] = useState('')
  const [devProgress, setDevProgress] = useState(0)
  const [resourceUsed, setResourceUsed] = useState(1)
  const [note, setNote] = useState('')
  const [priority, setPriority] = useState(DEFAULT_PRIORITY)
  const [startDate, setStartDate] = useState('')
  const [selectedLinkCardId, setSelectedLinkCardId] = useState('')
  const [savingCr, setSavingCr] = useState(false)

  useEffect(() => {
    setTeamRoster(getSavedTeamRoster(board))
  }, [board])

  useEffect(() => {
    if (activeCard) {
      setCrCode(activeCard.crCode || '')
      setSprint(activeCard.sprint || defaultSprint)
      setAssignee(activeCard.assignee || '')
      setBaStatus(activeCard.baStatus || 'Processing')
      setDevProgress(
        activeCard.devProgress !== undefined && activeCard.devProgress !== null
          ? snapProgress(activeCard.devProgress)
          : (['Ready for deploy', 'Deployed', 'Done testing', 'Done'].includes(activeCard.baStatus) ? 1 : 0)
      )
      setResourceUsed(
        activeCard.resourceUsed !== undefined && activeCard.resourceUsed !== null
          ? activeCard.resourceUsed
          : 1
      )
      if (activeCard.deadline) {
        setDeadline(activeCard.deadline)
      } else if (activeCard.dueDate) {
        const d = new Date(activeCard.dueDate)
        if (!Number.isNaN(d.getTime())) {
          setDeadline(d.toISOString().slice(0, 10))
        } else {
          setDeadline('')
        }
      } else {
        setDeadline('')
      }
      setNote(activeCard.note || '')
      setPriority(normalizePriority(activeCard.priority))
      setStartDate(toDateInputValue(activeCard.startDate))
    }
  }, [activeCard, defaultSprint])

  const handleCloseModal = () => {
    setShowCoverInput(false)
    dispatch(clearAndHideCurrentActiveCard())
  }

  const handleOpenCrStudio = () => {
    if (!board?._id || !activeCard?._id) return
    const targetUrl = `/boards/${board._id}/cr/${activeCard._id}`
    handleCloseModal()
    playUiChime('sparkle')
    navigate(targetUrl)
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

  const selectedAssigneesList = String(assignee || '')
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)

  const handleToggleRosterAssignee = (memberName) => {
    playUiChime('sparkle')
    const exists = selectedAssigneesList.some(
      n => n.toLowerCase() === memberName.toLowerCase()
    )
    const nextList = exists
      ? selectedAssigneesList.filter(n => n.toLowerCase() !== memberName.toLowerCase())
      : [...selectedAssigneesList, memberName]
    setAssignee(nextList.join(', '))
  }

  const handleAddUnregisteredMemberToRoster = () => {
    const trimmed = newRosterMemberName.trim()
    if (!trimmed) return
    const existsInRoster = teamRoster.some((m) => {
      const mName = typeof m === 'string' ? m : m?.name || ''
      return mName.toLowerCase() === trimmed.toLowerCase()
    })
    if (!existsInRoster) {
      const nextRoster = [...teamRoster, trimmed]
      setTeamRoster(nextRoster)
      saveTeamRoster(nextRoster)
    }
    if (!selectedAssigneesList.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      setAssignee([...selectedAssigneesList, trimmed].join(', '))
    }
    setNewRosterMemberName('')
    playUiChime('complete')
    toast.success(formatMessage('addedMemberToRosterToast', { name: trimmed }))
  }

  const onSaveBaCrMetadata = async (event) => {
    const targetEl = event?.currentTarget
    const nextProgress = snapProgress(devProgress)
    const isDone = nextProgress >= 1 || ['Deployed', 'Done testing', 'Done'].includes(baStatus)
    const dueDateTs = deadline ? new Date(`${deadline}T17:00:00`).getTime() : null
    const startDateTs = startDate ? new Date(`${startDate}T08:00:00`).getTime() : null
    const parsedResourceUsed = Number(resourceUsed)
    setSavingCr(true)
    try {
      await callApiUpdateCard({
        crCode: crCode.trim(),
        sprint: sprint.trim() || defaultSprint,
        assignee: assignee.trim(),
        baStatus,
        priority,
        startDate: Number.isNaN(startDateTs) ? null : startDateTs,
        deadline: deadline || null,
        dueDate: !Number.isNaN(dueDateTs) ? dueDateTs : null,
        devProgress: nextProgress,
        resourceUsed: !Number.isNaN(parsedResourceUsed) ? parsedResourceUsed : 0,
        isCompleted: ['Deployed', 'Done testing', 'Done'].includes(baStatus),
        note: note.trim()
      })
      playUiChime('complete')
      if (isDone) fxCelebrate(targetEl)
      toast.success(tPrimary('savedCrInfoToast'))
    } finally {
      setSavingCr(false)
    }
  }

  const onAppendFrdDoc = async (newDoc, autoDescriptionText = '') => {
    const nextDocs = [...(activeCard?.frdDocuments || []), newDoc]
    const updatePayload = { frdDocuments: nextDocs }
    if (autoDescriptionText && !activeCard?.description) {
      updatePayload.description = autoDescriptionText
    }
    await callApiUpdateCard(updatePayload)
  }

  const onAttachAiMarkdownAsFrd = async (fileName, markdownText) => {
    const newDoc = {
      id: `frd-ai-${Date.now()}`,
      name: fileName,
      type: 'text/markdown',
      size: markdownText.length,
      content: markdownText,
      source: 'antigravity-template',
      uploadedAt: Date.now()
    }
    await onAppendFrdDoc(newDoc, markdownText)
    playUiChime('complete')
    toast.success(tPrimary('savedAiFrdFileToast'))
  }

  const onDeleteFrdDocument = async (docId) => {
    const nextDocs = (activeCard?.frdDocuments || []).filter(d => d.id !== docId)
    await callApiUpdateCard({ frdDocuments: nextDocs })
    toast.info(tPrimary('removedFrdDocToast'))
  }

  const onApplyFrdToDescription = async (frdDoc) => {
    if (!frdDoc?.content || frdDoc.content.startsWith('data:')) {
      return
    }
    await callApiUpdateCard({ description: frdDoc.content })
    toast.success(formatMessage('appliedFrdToDescToast', { name: frdDoc.name }))
  }

  const onInsertBaFrdTemplate = async () => {
    const templateMd = GENERATE_BA_FRD_TEMPLATE(
      crCode || 'BNPL-945',
      activeCard?.title || 'Change Request'
    )
    const nextDesc = activeCard?.description
      ? `${activeCard.description}\n\n---\n\n${templateMd}`
      : templateMd
    await callApiUpdateCard({ description: nextDesc })
    playUiChime('sparkle')
    toast.success(tPrimary('appliedAiFrdToast'))
  }

  const onAddLinkedCard = async () => {
    if (!selectedLinkCardId) return
    const currentLinks = activeCard?.linkedCardIds || []
    if (currentLinks.includes(selectedLinkCardId)) {
      setSelectedLinkCardId('')
      return
    }
    await callApiUpdateCard({ linkedCardIds: [...currentLinks, selectedLinkCardId] })
    setSelectedLinkCardId('')
    playUiChime('sparkle')
    toast.success(formatMessage('linkedWithCardToast', { code: 'CR' }))
  }

  const onRemoveLinkedCard = async (targetId) => {
    const nextLinks = (activeCard?.linkedCardIds || []).filter(id => id !== targetId)
    await callApiUpdateCard({ linkedCardIds: nextLinks })
  }

  const onUpdateCardCover = (presetOrUrl) => {
    const finalCover = presetOrUrl !== undefined ? presetOrUrl : (coverUrlInput.trim() || null)
    callApiUpdateCard({ cover: finalCover }).then(() => {
      setShowCoverInput(false)
      setCoverUrlInput('')
    })
  }

  const onToggleElementalLabel = (labelObj) => {
    playUiChime('sparkle')
    const currentLabels = activeCard?.labels || []
    const exists = currentLabels.some(l => l.id === labelObj.id)
    const nextLabels = exists
      ? currentLabels.filter(l => l.id !== labelObj.id)
      : [...currentLabels, labelObj]
    callApiUpdateCard({ labels: nextLabels })
  }

  const onAddChecklistItem = () => {
    if (!newQuestTitle.trim()) return
    playUiChime('sparkle')
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
    const target = currentChecklist.find(item => item.id === itemId)
    if (target && !target.isCompleted) {
      playUiChime('complete')
    } else {
      playUiChime('sparkle')
    }
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

  const onAddSuggestedSubtasks = async (titles) => {
    const currentChecklist = activeCard?.checklist || []
    const stamp = Date.now()
    const newItems = titles.map((title, idx) => ({ id: `quest-${stamp}-${idx}`, title: title.slice(0, 200), isCompleted: false }))
    await callApiUpdateCard({ checklist: [...currentChecklist, ...newItems] })
    playUiChime('complete')
  }

  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo })
  }

  const handleDeleteCard = () => {
    confirmDeleteCard({
      title: tPrimary('deleteCardConfirmTitle'),
      description: formatMessage('deleteCardConfirmDesc', { title: activeCard?.title || 'CR' }),
      confirmationText: tPrimary('deleteCrCardBtn'),
      cancellationText: tPrimary('cancelBtn')
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

      deleteCardDetailsAPI(cardId).then(() => {
        toast.success(tPrimary('deletedCrCardToast'))
      })
    }).catch(() => {})
  }

  const resolvedCover = resolveCardCoverUrl(activeCard?.cover)
  const checklist = activeCard?.checklist || []
  const completedCount = checklist.filter(i => i.isCompleted).length
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0
  const deadlineInfo = getDeadlineStatus({
    ...activeCard,
    baStatus,
    deadline
  })

  const allBoardCards = collectBoardCardsWithColumn(board)
    .map(item => item.card)
    .filter(c => c._id !== activeCard?._id)
  const linkedCards = (activeCard?.linkedCardIds || [])
    .map(id => allBoardCards.find(c => c._id === id))
    .filter(Boolean)

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 1020,
        maxWidth: '96vw',
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '16px',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        outline: 0,
        padding: '36px 24px 24px',
        margin: '32px auto',
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
          <Box sx={{ mb: 3 }}>
            <img
              style={{ width: '100%', height: '240px', borderRadius: '12px', objectFit: 'cover' }}
              src={resolvedCover}
              alt="card-cover"
            />
          </Box>
        }

        <Box sx={{ mb: 2, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <SoraRibbonIcon />
          {crCode && (
            <Chip
              label={crCode}
              size="small"
              color="info"
              sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.82rem' }}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <ToggleFocusInput
              inputFontSize='22px'
              value={activeCard?.title || ''}
              onChangedValue={onUpdateCardTitle} />
          </Box>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<AccountTreeRoundedIcon />}
            onClick={handleOpenCrStudio}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px', flexShrink: 0 }}
          >
            {t('openCrStudio')}
          </Button>
          <Chip
            label={deadlineInfo.label}
            size="small"
            sx={{
              fontWeight: 700,
              color: deadlineInfo.color,
              bgcolor: deadlineInfo.bgColor,
              border: `1px solid ${deadlineInfo.color}66`
            }}
          />
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          <Grid xs={12} sm={8.5}>
            {/* Change Request (CR) Metadata Hub aligned with Sprint 34 Template */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(240, 249, 255, 0.65)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentOutlinedIcon color="primary" />
                  <Typography sx={{ fontWeight: 800, fontSize: '16px', color: 'primary.main' }}>
                    {t('crTrackingSection')}
                  </Typography>
                </Box>
                <LoadingButton
                  size="small"
                  variant="contained"
                  loading={savingCr}
                  startIcon={<SaveRoundedIcon />}
                  onClick={onSaveBaCrMetadata}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                >
                  {t('saveCrBtn')}
                </LoadingButton>
              </Box>

              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label="Ticket ID (VD: BNPL-945)"
                    size="small"
                    value={crCode}
                    onChange={(e) => setCrCode(e.target.value)}
                    sx={{ width: { xs: '100%', sm: '180px' } }}
                  />
                  <TextField
                    label="Sprint"
                    size="small"
                    value={sprint}
                    onChange={(e) => setSprint(e.target.value)}
                    placeholder={defaultSprint}
                    sx={{ width: { xs: '100%', sm: '140px' } }}
                  />
                  <TextField
                    select
                    label={t('priorityLabel')}
                    size="small"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    sx={{ width: { xs: '100%', sm: '150px' } }}
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.icon} {opt.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Status"
                    size="small"
                    fullWidth
                    value={baStatus}
                    onChange={(e) => setBaStatus(e.target.value)}
                  >
                    {BA_STATUS_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    label={t('crStartDate')}
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <TextField
                    label="Due date for dev"
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  <ProgressSelect value={devProgress} onChange={setDevProgress} />
                  <TextField
                    label="Resource used (Point)"
                    type="number"
                    size="small"
                    fullWidth
                    inputProps={{ step: '0.25', min: 0, max: 100 }}
                    value={resourceUsed}
                    onChange={(e) => setResourceUsed(e.target.value)}
                  />
                </Stack>

                {/* Handle by (Unregistered Team Roster Multi-Select + Custom Input) */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    border: '1px dashed rgba(56, 189, 248, 0.35)',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.85)'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.75, color: 'primary.main' }}>
                    👤 {t('handleByQuickPickLabel')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, mb: 1.25 }}>
                    {teamRoster.map((member) => {
                      const memberName = typeof member === 'string' ? member : member?.name || ''
                      if (!memberName) return null
                      const isAssigned = selectedAssigneesList.some(
                        n => n.toLowerCase() === memberName.toLowerCase()
                      )
                      return (
                        <Chip
                          key={memberName}
                          label={isAssigned ? `✓ ${memberName}` : memberName}
                          size="small"
                          color={isAssigned ? 'primary' : 'default'}
                          variant={isAssigned ? 'filled' : 'outlined'}
                          onClick={() => handleToggleRosterAssignee(memberName)}
                          sx={{ fontWeight: 700, cursor: 'pointer' }}
                        />
                      )
                    })}
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label={tPrimary('handleByInputLabel')}
                      size="small"
                      fullWidth
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="Ho Thao Dieu, Hoang Vinh Son"
                    />
                    <TextField
                      label={tPrimary('addNewMemberPlaceholder')}
                      size="small"
                      value={newRosterMemberName}
                      onChange={(e) => setNewRosterMemberName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddUnregisteredMemberToRoster()
                        }
                      }}
                      sx={{ minWidth: { xs: '100%', sm: '210px' } }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PersonAddAlt1RoundedIcon />}
                      onClick={handleAddUnregisteredMemberToRoster}
                      sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      {t('assignMoreBtn')}
                    </Button>
                  </Stack>
                </Box>

                <TextField
                  label={tPrimary('noteInputLabel')}
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={tPrimary('noteInputPlaceholder')}
                />
              </Stack>
            </Box>

            {/* FRD Documents & Knowledge Linking Section */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: '12px',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 27, 75, 0.25)' : 'rgba(245, 243, 255, 0.6)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionOutlinedIcon color="secondary" />
                  <Typography sx={{ fontWeight: 800, fontSize: '16px' }}>
                    {t('frdDocsAndLinksSection')}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={() => exportCardAsFrdMarkdown(activeCard, sprint)}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                >
                  {t('downloadFrdBtn')}
                </Button>
              </Box>

              <GoogleDriveFrdControls
                boardId={board?._id}
                activeCard={activeCard}
                onAppendFrdDoc={onAppendFrdDoc}
                onDeleteFrdDoc={onDeleteFrdDocument}
                onApplyFrdToDescription={onApplyFrdToDescription}
              />

              {/* Knowledge Linking between CRs */}
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LinkRoundedIcon fontSize="small" color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatMessage('relatedCrsInSystemTitle', { count: linkedCards.length })}
                </Typography>
              </Box>
              {linkedCards.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                  {linkedCards.map(lc => (
                    <Chip
                      key={lc._id}
                      label={`${lc.crCode ? `[${lc.crCode}] ` : ''}${lc.title}`}
                      onClick={() => dispatch(updateCurrentActiveCard(lc))}
                      onDelete={() => onRemoveLinkedCard(lc._id)}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 700, cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              )}
              <Stack direction="row" spacing={1}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label={tPrimary('selectCrToLinkLabel')}
                  value={selectedLinkCardId}
                  onChange={(e) => setSelectedLinkCardId(e.target.value)}
                >
                  {allBoardCards.map(c => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.crCode ? `[${c.crCode}] ` : ''}{c.title}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="outlined" size="small" onClick={onAddLinkedCard} sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0 }}>
                  {t('linkCrBtn')}
                </Button>
              </Stack>
            </Box>

            {/* Tags Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LabelImportantOutlinedIcon fontSize="small" color="primary" />
                <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '15px' }}>
                  {t('tagsSectionTitle')}
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
                {t('registeredMembersTitle')}
              </Typography>
              <CardUserGroup
                cardMemberIds={activeCard?.memberIds}
                onUpdateCardMembers={onUpdateCardMembers}
              />
            </Box>

            {/* Subtasks / Acceptance Criteria Checklist Section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FactCheckOutlinedIcon color="primary" />
                  <Typography variant="span" sx={{ fontWeight: 700, fontSize: '18px' }}>
                    {formatMessage('subtasksChecklistTitle', { done: completedCount, total: checklist.length })}
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
                  placeholder={tPrimary('addSubtaskPlaceholder')}
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
                  {t('addBtn')}
                </Button>
              </Box>
              <CrAssistantPanel
                card={activeCard}
                boardCards={allBoardCards}
                onAddItems={onAddSuggestedSubtasks}
                onApplyMarkdownToDescription={onUpdateCardDescription}
                onAttachMarkdownAsFrd={onAttachAiMarkdownAsFrd}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SubjectRoundedIcon color="primary" />
                  <Typography variant="span" sx={{ fontWeight: 700, fontSize: '18px' }}>
                    {t('frdDetailSectionTitle')}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoFixHighRoundedIcon />}
                  onClick={onInsertBaFrdTemplate}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                >
                  {t('insertFrdTemplateBtn')}
                </Button>
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
                  {t('activitySectionTitle')}
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
              {t('quickActionsTitle')}
            </Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem
                className="active"
                onClick={handleOpenCrStudio}
                sx={{
                  bgcolor: 'rgba(56, 189, 248, 0.16)',
                  border: '1px solid rgba(56, 189, 248, 0.45)'
                }}
              >
                <AccountTreeRoundedIcon fontSize="small" color="primary" />
                <span>{t('openCrStudio')}</span>
              </SidebarItem>
              {currentUser?._id && !activeCard?.memberIds?.includes(currentUser._id) &&
                <SidebarItem
                  className="active"
                  onClick={() => onUpdateCardMembers({
                    userId: currentUser._id,
                    action: CARD_MEMBER_ACTIONS.ADD
                  })}
                >
                  <PersonOutlineOutlinedIcon fontSize="small" />
                  <span>{t('joinCardBtn')}</span>
                </SidebarItem>
              }
              <SidebarItem
                className="active"
                onClick={onInsertBaFrdTemplate}
              >
                <AutoFixHighRoundedIcon fontSize="small" />
                <span>{t('insertFrdTemplateBtn')}</span>
              </SidebarItem>
              <SidebarItem
                className="active"
                onClick={() => exportCardAsFrdMarkdown(activeCard, sprint)}
              >
                <DownloadRoundedIcon fontSize="small" />
                <span>{t('downloadFrdBtn')}</span>
              </SidebarItem>
              <SidebarItem
                className="active"
                onClick={() => {
                  setCoverUrlInput(activeCard?.cover || '')
                  setShowCoverInput(!showCoverInput)
                }}
              >
                <ImageOutlinedIcon fontSize="small" />
                <span>{t('coverImageBtn')}</span>
              </SidebarItem>

              {showCoverInput &&
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.25, border: '1px solid rgba(125, 211, 252, 0.35)', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <SoraBunnyIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {t('selectCoverTitle')}:
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {SORA_PRESET_COVERS.map((preset) => (
                      <Chip
                        key={preset.key}
                        label={preset.label}
                        size="small"
                        color={activeCard?.cover === preset.key ? 'secondary' : 'primary'}
                        variant={activeCard?.cover === preset.key ? 'filled' : 'outlined'}
                        onClick={() => onUpdateCardCover(preset.key)}
                        clickable
                      />
                    ))}
                    {activeCard?.cover && (
                      <Chip
                        label={tPrimary('clearCoverBtn')}
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
                    label={tPrimary('pasteImageUrlLabel')}
                    value={coverUrlInput}
                    onChange={(e) => setCoverUrlInput(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button size="small" variant="contained" color="info" onClick={() => onUpdateCardCover()}>
                      {t('applyBtn')}
                    </Button>
                  </Box>
                </Box>
              }
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="column" spacing={1}>
              <SidebarItem
                onClick={handleDeleteCard}
                sx={{ color: 'error.main', '&:hover': { color: 'error.dark' } }}
              >
                <DeleteOutlineIcon fontSize="small" />
                <span>{t('deleteCrCardBtn')}</span>
              </SidebarItem>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default ActiveCard
