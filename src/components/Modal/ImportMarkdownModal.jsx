import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import { toast } from 'react-toastify'
import { createNewCardAPI } from '~/apis'
import {
  selectCurrentActiveBoard,
  updateCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import {
  BA_STATUS_OPTIONS,
  DEFAULT_SPRINT_CONFIG,
  GENERATE_BA_FRD_TEMPLATE
} from '~/utils/excelExporter'
import { playUiChime } from '~/utils/soundEffects'

const parseMarkdownToCrSpec = (mdText, defaultSprint = 'Sprint 34', defaultAssignee = '') => {
  const lines = String(mdText || '').split(/\r?\n/)
  let parsedTitle = ''
  let parsedCrCode = ''
  let parsedSprint = defaultSprint
  let parsedAssignee = defaultAssignee
  let parsedStatus = 'In Analysis'
  let parsedDeadline = '2026-11-05'
  let parsedNote = ''
  const checklist = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!parsedTitle && /^#\s+/.test(line)) {
      const heading = line.replace(/^#\s+/, '').trim()
      // Match patterns like "[BNPL-1] Title" or "FRD [BNPL-1]: Title" or "BNPL-1: Title"
      const bracketMatch = heading.match(/\[([A-Za-z0-9_-]+)\]\s*:?\s*(.+)/)
      const prefixMatch = heading.match(/^([A-Z]{2,10}-\d+)\s*[:-]\s*(.+)/)
      if (bracketMatch) {
        parsedCrCode = bracketMatch[1].toUpperCase()
        parsedTitle = bracketMatch[2].trim()
      } else if (prefixMatch) {
        parsedCrCode = prefixMatch[1].toUpperCase()
        parsedTitle = prefixMatch[2].trim()
      } else {
        parsedTitle = heading
      }
      continue
    }

    const crMatch = line.match(/^(?:-\s*)?\*?\*?(?:Mã CR|CR Code|CR ID)\*?\*?\s*:\s*(.+)$/i)
    if (crMatch) {
      parsedCrCode = crMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const sprintMatch = line.match(/^(?:-\s*)?\*?\*?(?:Kỳ Sprint|Sprint)\*?\*?\s*:\s*(.+)$/i)
    if (sprintMatch) {
      parsedSprint = sprintMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const picMatch = line.match(/^(?:-\s*)?\*?\*?(?:Người phụ trách|PIC|Assignee)\*?\*?\s*:\s*(.+)$/i)
    if (picMatch) {
      parsedAssignee = picMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const statusMatch = line.match(/^(?:-\s*)?\*?\*?(?:Trạng thái|Status)\*?\*?\s*:\s*(.+)$/i)
    if (statusMatch) {
      parsedStatus = statusMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const deadlineMatch = line.match(/^(?:-\s*)?\*?\*?(?:Deadline|Hạn hoàn thành|Due Date)\*?\*?\s*:\s*([0-9/-]+)/i)
    if (deadlineMatch) {
      const rawDate = deadlineMatch[1].trim()
      const dmy = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      if (dmy) {
        parsedDeadline = `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
      } else {
        parsedDeadline = rawDate
      }
      continue
    }

    const noteMatch = line.match(/^(?:-\s*)?\*?\*?(?:Ghi chú|Note|BA Note)\*?\*?\s*:\s*(.+)$/i)
    if (noteMatch) {
      parsedNote = noteMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const taskMatch = line.match(/^-\s*\[([ xX])\]\s+(.+)$/)
    if (taskMatch) {
      checklist.push({
        id: `chk-${Date.now()}-${checklist.length}`,
        title: taskMatch[2].trim().slice(0, 190),
        isCompleted: taskMatch[1].toLowerCase() === 'x'
      })
    }
  }

  return {
    title: (parsedTitle || 'Change Request mới từ tài liệu Markdown').slice(0, 140),
    crCode: parsedCrCode || 'BNPL-3',
    sprint: parsedSprint || defaultSprint,
    assignee: parsedAssignee || defaultAssignee,
    baStatus: parsedStatus,
    deadline: parsedDeadline,
    note: parsedNote,
    checklist
  }
}

function ImportMarkdownModal({ open, onClose, accentColor = '#38bdf8' }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)

  const defaultSprint = board?.sprintConfig?.name || DEFAULT_SPRINT_CONFIG.name
  const defaultAssignee = currentUser?.displayName || 'Thanh Phuc (BA)'

  const [selectedColumnId, setSelectedColumnId] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('FRD_BNPL-3_Specification.md')
  const [crCode, setCrCode] = useState('BNPL-3')
  const [title, setTitle] = useState('')
  const [sprint, setSprint] = useState(defaultSprint)
  const [assignee, setAssignee] = useState(defaultAssignee)
  const [baStatus, setBaStatus] = useState('In Analysis')
  const [deadline, setDeadline] = useState('2026-11-05')
  const [note, setNote] = useState('')
  const [parsedChecklist, setParsedChecklist] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && board?.columns?.length > 0 && !selectedColumnId) {
      setSelectedColumnId(board.columns[0]._id)
    }
  }, [open, board, selectedColumnId])

  const applyParsedMarkdown = (text, fileName = 'FRD_Specification.md') => {
    setMarkdownContent(text)
    setUploadedFileName(fileName)
    const parsed = parseMarkdownToCrSpec(text, defaultSprint, defaultAssignee)
    setTitle(parsed.title)
    setCrCode(parsed.crCode)
    setSprint(parsed.sprint)
    setAssignee(parsed.assignee)
    setBaStatus(parsed.baStatus)
    setDeadline(parsed.deadline)
    if (parsed.note) setNote(parsed.note)
    setParsedChecklist(parsed.checklist)
  }

  const handleUploadMdFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = String(e.target?.result || '')
      applyParsedMarkdown(content, file.name)
      toast.info(`Đã phân tích file "${file.name}" thành thông tin CR Ticket!`)
    }
    reader.readAsText(file, 'UTF-8')
    event.target.value = ''
  }

  const handleLoadSampleFrd = () => {
    const sample = [
      GENERATE_BA_FRD_TEMPLATE('BNPL-3', 'Tích hợp thông báo nhắc nợ đa kênh (Push / ZNS / SMS) trước kỳ sao kê'),
      '',
      '## 7. Checklist Triển khai BA & UAT',
      '- [x] Thống nhất mẫu template ZNS với bộ phận Vận hành & Pháp chế',
      '- [ ] Đặc tả API truyền biến động số dư kỳ sao kê sang Notification Service',
      '- [ ] Nghiệm thu UAT các kịch bản fallback từ ZNS sang SMS'
    ].join('\n')
    applyParsedMarkdown(sample, 'FRD_BNPL-3_MultiChannel_Reminder.md')
    setNote('CR thuộc kỳ Sprint 34 (22/10 - 05/11), ưu tiên hoàn tất UAT trước ngày 04/11.')
  }

  const handleCreateTicketFromMarkdown = async () => {
    if (!selectedColumnId) {
      toast.warning('Vui lòng chọn cột (Column) để tạo CR Ticket!')
      return
    }
    if (!title || title.trim().length < 3) {
      toast.warning('Tên CR cần tối thiểu 3 ký tự!')
      return
    }

    try {
      setIsSubmitting(true)
      const dueDateTimestamp = deadline
        ? new Date(`${deadline}T17:00:00`).getTime()
        : null

      const frdDoc = markdownContent.trim()
        ? [{
          id: `frd-${Date.now()}`,
          name: uploadedFileName || `FRD_${crCode || 'CR'}.md`,
          type: 'text/markdown',
          size: markdownContent.length,
          content: markdownContent,
          source: 'markdown-import',
          uploadedAt: Date.now()
        }]
        : []

      const createdCard = await createNewCardAPI({
        boardId: board._id,
        columnId: selectedColumnId,
        title: title.trim(),
        description: markdownContent.trim() || GENERATE_BA_FRD_TEMPLATE(crCode, title.trim()),
        crCode: crCode.trim(),
        sprint: sprint.trim() || defaultSprint,
        assignee: assignee.trim(),
        baStatus,
        deadline: deadline || null,
        dueDate: !Number.isNaN(dueDateTimestamp) ? dueDateTimestamp : null,
        note: note.trim(),
        labels: [
          { id: 'cr-import', title: `📋 ${crCode.trim() || 'CR'} • FRD`, color: '#0284c7' }
        ],
        checklist: parsedChecklist,
        frdDocuments: frdDoc
      })

      const newBoard = cloneDeep(board)
      const targetCol = newBoard.columns.find(c => c._id === selectedColumnId)
      if (targetCol) {
        if (targetCol.cards.some(card => card.FE_PlaceholderCard)) {
          targetCol.cards = [createdCard]
          targetCol.cardOrderIds = [createdCard._id]
        } else {
          targetCol.cards.push(createdCard)
          targetCol.cardOrderIds.push(createdCard._id)
        }
        dispatch(updateCurrentActiveBoard(newBoard))
      }

      playUiChime('complete')
      toast.success(`Đã khởi tạo CR Ticket [${crCode}] kèm tài liệu FRD thành công!`)
      onClose()
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '18px',
          border: `1px solid ${accentColor}55`
        }
      }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <DescriptionRoundedIcon sx={{ color: accentColor }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Import Markdown / Antigravity Spec thành CR Ticket
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Tự động bóc tách Mã CR, Tên CR, Checklist nghiệm thu và đính kèm file FRD vào thẻ
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            component="label"
            size="small"
            variant="contained"
            startIcon={<UploadFileRoundedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
            Tải file .MD / .TXT
            <input type="file" hidden accept=".md,.markdown,.txt" onChange={handleUploadMdFile} />
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoFixHighRoundedIcon />}
            onClick={handleLoadSampleFrd}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
            Nạp mẫu FRD chuẩn BA
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Mã CR (VD: BNPL-1)"
              size="small"
              value={crCode}
              onChange={(e) => setCrCode(e.target.value)}
              sx={{ width: { xs: '100%', sm: '180px' } }}
            />
            <TextField
              label="Tên Change Request (CR Title)"
              size="small"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Xây dựng luồng xét duyệt hạn mức BNPL..."
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              label="Cột đích trên Board"
              size="small"
              fullWidth
              value={selectedColumnId}
              onChange={(e) => setSelectedColumnId(e.target.value)}>
              {(board?.columns || []).map(col => (
                <MenuItem key={col._id} value={col._id}>{col.title}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Kỳ Sprint"
              size="small"
              fullWidth
              value={sprint}
              onChange={(e) => setSprint(e.target.value)}
              placeholder="Sprint 34"
            />

            <TextField
              select
              label="Trạng thái BA (Status)"
              size="small"
              fullWidth
              value={baStatus}
              onChange={(e) => setBaStatus(e.target.value)}>
              {BA_STATUS_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Người phụ trách (PIC)"
              size="small"
              fullWidth
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
            <TextField
              label="Deadline (Hạn hoàn thành)"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <TextField
              label="Tên file FRD đính kèm"
              size="small"
              fullWidth
              value={uploadedFileName}
              onChange={(e) => setUploadedFileName(e.target.value)}
            />
          </Stack>

          <TextField
            label="Note cần thiết (Ghi chú xuất ra báo cáo Excel Sprint)"
            size="small"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Chờ đội Core Banking xác nhận mã lỗi timeout trước ngày 02/11..."
          />

          <TextField
            label="Nội dung tài liệu Markdown / FRD (Dán trực tiếp hoặc tải từ file .md)"
            multiline
            minRows={8}
            maxRows={14}
            fullWidth
            value={markdownContent}
            onChange={(e) => applyParsedMarkdown(e.target.value, uploadedFileName)}
            placeholder="# [BNPL-3] Tiêu đề CR&#10;- Mã CR: BNPL-3&#10;- Kỳ Sprint: Sprint 34&#10;- Deadline: 05/11/2026&#10;&#10;## Quy tắc nghiệp vụ&#10;- [ ] Subtask 1&#10;- [ ] Subtask 2"
            sx={{
              '& textarea': {
                fontFamily: 'monospace',
                fontSize: '0.84rem'
              }
            }}
          />

          {parsedChecklist.length > 0 && (
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                Đã phát hiện {parsedChecklist.length} hạng mục Subtask / UAT Checklist từ file Markdown:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {parsedChecklist.map(item => (
                  <Chip
                    key={item.id}
                    size="small"
                    icon={<AssignmentTurnedInRoundedIcon />}
                    label={item.title}
                    color={item.isCompleted ? 'success' : 'default'}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Đóng
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={handleCreateTicketFromMarkdown}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px', px: 2.5 }}>
          {isSubmitting ? 'Đang khởi tạo CR Ticket...' : `Tạo CR Ticket [${crCode || 'CR'}] & Đính kèm FRD`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ImportMarkdownModal
