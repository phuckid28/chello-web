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
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded'
import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import { toast } from 'react-toastify'
import { createNewCardAPI, updateBoardDetailsAPI } from '~/apis'
import { DEFAULT_PRIORITY, PRIORITY_OPTIONS, normalizePriority } from '~/utils/crMeta'
import {
  selectCurrentActiveBoard,
  updateCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import {
  BA_STATUS_OPTIONS,
  DEFAULT_SPRINT_CONFIG,
  GENERATE_BA_FRD_TEMPLATE,
  getSavedTeamRoster,
  parseSprintCsvTemplate,
  saveTeamRoster
} from '~/utils/excelExporter'
import { snapProgress } from '~/utils/progress'
import ProgressSelect from '~/components/Modal/ProgressSelect'
import LoadingButton from '~/components/Loading/LoadingButton'
import { fxCelebrate } from '~/fx/fxEvents'
import { playUiChime } from '~/utils/soundEffects'

const buildSampleSprintCsv = (sprintNum = '34') => [
  `Sprint,${sprintNum},,,Status,,Handle by,Resource point,`,
  'Start date,10/22/2026,,,Processing,,Lam Chi Kien,1,',
  'End date,11/5/2026,,,In testing,,Phan Nguyen Song Toan,1,',
  'Update till,10/26/2026,,,Blocking,,Ho Thao Dieu,0.5,',
  'By,Dao Thanh Phuc,,,Ready for deploy,,Nguyen Phuoc Long,1,',
  'Note,,,,Deployed,,Nguyen Khanh Duy,1,',
  ',,,,Done testing,,Hoang Vinh Son ,0.5,',
  ',,,,,,Bui Hoang Gia Phuc,1,',
  ',,,,,,Vo Viet Binh,1,',
  'Ticket ID,CR Description,Status,Handle by,Due date for dev,Dev Progress,Resource used,Note,',
  'BNPL-945,Usage Limit - Monthly 1 time synchronized update for user,Ready for deploy,"Ho Thao Dieu, Hoang Vinh Son ",5/11,100%,1,Đồng bộ hạn mức 1 lần/tháng cho user,'
].join('\n')

const parseMarkdownToCrSpec = (mdText, defaultSprint = 'Sprint 34', defaultAssignee = 'Ho Thao Dieu, Hoang Vinh Son') => {
  const lines = String(mdText || '').split(/\r?\n/)
  let parsedTitle = ''
  let parsedCrCode = ''
  let parsedSprint = defaultSprint
  let parsedAssignee = defaultAssignee
  let parsedStatus = 'Ready for deploy'
  let parsedDeadline = '2026-11-05'
  let parsedDevProgress = 1
  let parsedResourceUsed = 1
  let parsedNote = ''
  let parsedPriority = DEFAULT_PRIORITY
  const checklist = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!parsedTitle && /^#\s+/.test(line)) {
      const heading = line.replace(/^#\s+/, '').trim()
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

    const crMatch = line.match(/^(?:-\s*)?\*?\*?(?:Mã CR|Ticket ID|CR Code|CR ID)\*?\*?\s*:\s*(.+)$/i)
    if (crMatch) {
      parsedCrCode = crMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const sprintMatch = line.match(/^(?:-\s*)?\*?\*?(?:Kỳ Sprint|Sprint)\*?\*?\s*:\s*(.+)$/i)
    if (sprintMatch) {
      parsedSprint = sprintMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const picMatch = line.match(/^(?:-\s*)?\*?\*?(?:Người phụ trách|Handle by|PIC|Assignee)\*?\*?\s*:\s*(.+)$/i)
    if (picMatch) {
      parsedAssignee = picMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const statusMatch = line.match(/^(?:-\s*)?\*?\*?(?:Trạng thái|Status)\*?\*?\s*:\s*(.+)$/i)
    if (statusMatch) {
      parsedStatus = statusMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const deadlineMatch = line.match(/^(?:-\s*)?\*?\*?(?:Deadline|Due date for dev|Hạn hoàn thành|Due Date)\*?\*?\s*:\s*([0-9/-]+)/i)
    if (deadlineMatch) {
      const rawDate = deadlineMatch[1].trim()
      const dmy = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      const shortDm = rawDate.match(/^(\d{1,2})\/(\d{1,2})$/)
      if (dmy) {
        parsedDeadline = `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
      } else if (shortDm) {
        parsedDeadline = `${new Date().getFullYear()}-${shortDm[2].padStart(2, '0')}-${shortDm[1].padStart(2, '0')}`
      } else {
        parsedDeadline = rawDate
      }
      continue
    }

    const noteMatch = line.match(/^(?:-\s*)?\*?\*?(?:Ghi chú|Note)\*?\*?\s*:\s*(.+)$/i)
    if (noteMatch) {
      parsedNote = noteMatch[1].replace(/[*`]/g, '').trim()
      continue
    }

    const priorityMatch = line.match(/^(?:-\s*)?\*?\*?(?:Priority|Độ ưu tiên|Mức ưu tiên)\*?\*?\s*:\s*(.+)$/i)
    if (priorityMatch) {
      parsedPriority = normalizePriority(priorityMatch[1].replace(/[*`]/g, '').trim())
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
    title: (parsedTitle || 'Usage Limit - Monthly 1 time synchronized update for user').slice(0, 140),
    crCode: parsedCrCode || 'BNPL-945',
    sprint: parsedSprint || defaultSprint,
    assignee: parsedAssignee || defaultAssignee,
    baStatus: parsedStatus,
    deadline: parsedDeadline,
    devProgress: parsedDevProgress,
    resourceUsed: parsedResourceUsed,
    note: parsedNote,
    priority: parsedPriority,
    checklist
  }
}

function ImportMarkdownModal({ open, onClose, accentColor = '#38bdf8' }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActiveBoard)

  const defaultSprint = board?.sprintConfig?.name || DEFAULT_SPRINT_CONFIG.name
  const defaultAssignee = 'Ho Thao Dieu, Hoang Vinh Son'

  const [selectedColumnId, setSelectedColumnId] = useState('')
  const [markdownContent, setMarkdownContent] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('FRD_BNPL-945_Usage_Limit.md')
  const [crCode, setCrCode] = useState('BNPL-945')
  const [title, setTitle] = useState('Usage Limit - Monthly 1 time synchronized update for user')
  const [sprint, setSprint] = useState(defaultSprint)
  const [assignee, setAssignee] = useState(defaultAssignee)
  const [baStatus, setBaStatus] = useState('Ready for deploy')
  const [deadline, setDeadline] = useState('2026-11-05')
  const [devProgress, setDevProgress] = useState(1)
  const [resourceUsed, setResourceUsed] = useState(1)
  const [note, setNote] = useState('')
  const [priority, setPriority] = useState(DEFAULT_PRIORITY)
  const [parsedChecklist, setParsedChecklist] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teamRoster, setTeamRoster] = useState(() => getSavedTeamRoster(board))

  useEffect(() => {
    if (open && board?.columns?.length > 0 && !selectedColumnId) {
      setSelectedColumnId(board.columns[0]._id)
    }
    if (open) {
      setSprint(board?.sprintConfig?.name || DEFAULT_SPRINT_CONFIG.name)
    }
    setTeamRoster(getSavedTeamRoster(board))
  }, [open, board, selectedColumnId])

  const applyParsedMarkdown = (text, fileName = 'FRD_Specification.md') => {
    setMarkdownContent(text)
    setUploadedFileName(fileName)

    if (/Ticket ID\s*,\s*CR Description/i.test(text)) {
      const csvParsed = parseSprintCsvTemplate(text)
      if (csvParsed.teamRoster?.length > 0) {
        setTeamRoster(csvParsed.teamRoster)
        saveTeamRoster(csvParsed.teamRoster)
      }
      if (csvParsed.cards?.length > 0) {
        const firstCr = csvParsed.cards[0]
        setCrCode(firstCr.crCode || 'BNPL-945')
        setTitle(firstCr.title || '')
        setBaStatus(firstCr.baStatus || 'Ready for deploy')
        setAssignee(firstCr.assignee || defaultAssignee)
        setDeadline(firstCr.deadline || '2026-11-05')
        setDevProgress(snapProgress(firstCr.devProgress ?? 1))
        setResourceUsed(firstCr.resourceUsed ?? 1)
        setNote(firstCr.note || '')
      }
      return
    }

    const parsed = parseMarkdownToCrSpec(text, defaultSprint, defaultAssignee)
    setTitle(parsed.title)
    setCrCode(parsed.crCode)
    setSprint(parsed.sprint)
    setAssignee(parsed.assignee)
    setBaStatus(parsed.baStatus)
    setDeadline(parsed.deadline)
    setDevProgress(snapProgress(parsed.devProgress))
    setResourceUsed(parsed.resourceUsed)
    setNote(parsed.note || '')
    setPriority(parsed.priority)
    setParsedChecklist(parsed.checklist)
  }

  const handleUploadMdOrCsvFile = (event) => {
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

  const handleLoadSprintCsvSample = () => {
    const sprintNum = board?.sprintConfig?.number || String(defaultSprint).replace(/\D+/g, '') || '34'
    applyParsedMarkdown(buildSampleSprintCsv(sprintNum), `${defaultSprint.replace(/\s+/g, '_')}_Template_BNPL-945.csv`)
    playUiChime('sparkle')
    toast.success(`Đã nạp mẫu CSV ${defaultSprint} (BNPL-945 & Danh sách Handle by)!`)
  }

  const handleLoadSampleFrd = () => {
    const sample = [
      GENERATE_BA_FRD_TEMPLATE('BNPL-945', 'Usage Limit - Monthly 1 time synchronized update for user'),
      '',
      '## 7. Checklist Triển khai & Nghiệm thu UAT',
      '- [x] Kiểm tra cơ chế Idempotency-Key chống ghi đè hạn mức trong cùng tháng',
      '- [x] Xác nhận cảnh báo 409 Conflict khi user đã đồng bộ trong tháng hiện tại',
      '- [ ] Nghiệm thu UAT luồng đồng bộ hạn mức với đội Core Payment'
    ].join('\n')
    applyParsedMarkdown(sample, 'FRD_BNPL-945_Usage_Limit.md')
    setNote(`Đồng bộ hạn mức 1 lần/tháng cho user (${defaultSprint}).`)
  }

  const selectedAssigneesList = String(assignee || '')
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)

  const handleToggleAssigneeChip = (memberName) => {
    const exists = selectedAssigneesList.some(
      n => n.toLowerCase() === memberName.toLowerCase()
    )
    const next = exists
      ? selectedAssigneesList.filter(n => n.toLowerCase() !== memberName.toLowerCase())
      : [...selectedAssigneesList, memberName]
    setAssignee(next.join(', '))
  }

  const handleCreateTicketFromMarkdown = async () => {
    if (!selectedColumnId) {
      toast.warning('Vui lòng chọn cột chủ đề CR (Column) để tạo Ticket!')
      return
    }
    if (!title || title.trim().length < 3) {
      toast.warning('CR Description cần tối thiểu 3 ký tự!')
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
        devProgress: snapProgress(devProgress),
        resourceUsed: Number(resourceUsed) || 0,
        note: note.trim(),
        priority,
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
      }

      // Show the new CR immediately, then persist an imported roster without blocking the import
      dispatch(updateCurrentActiveBoard(newBoard))

      const savedRoster = getSavedTeamRoster(board)
      if (JSON.stringify(savedRoster) !== JSON.stringify(teamRoster)) {
        const nextSprintConfig = { ...DEFAULT_SPRINT_CONFIG, ...(board?.sprintConfig || {}), teamRoster }
        try {
          await updateBoardDetailsAPI(board._id, { sprintConfig: nextSprintConfig })
          dispatch(updateCurrentActiveBoard({ ...newBoard, sprintConfig: nextSprintConfig }))
        } catch (rosterError) {
          // Roster sync is optional; the interceptor already showed the reason (e.g. read-only board)
        }
      }

      playUiChime('complete')
      if (snapProgress(devProgress) >= 1 || baStatus === 'Deployed' || baStatus === 'Done testing') {
        fxCelebrate()
      }
      toast.success(`Đã khởi tạo CR Ticket [${crCode}] thành công!`)
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <DescriptionRoundedIcon sx={{ color: accentColor }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Import Markdown / CSV Template Sprint thành CR Ticket
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Hỗ trợ cả file .MD (FRD) và file .CSV mẫu {defaultSprint} (Ticket ID, CR Description, Status, Handle by, Due date, Dev Progress 0%–100%)
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button
            component="label"
            size="small"
            variant="contained"
            startIcon={<UploadFileRoundedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
            Tải file .MD / .CSV / .TXT
            <input type="file" hidden accept=".md,.markdown,.csv,.txt" onChange={handleUploadMdOrCsvFile} />
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<TableChartRoundedIcon />}
            onClick={handleLoadSprintCsvSample}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
            Mẫu CSV {defaultSprint} (BNPL-945)
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoFixHighRoundedIcon />}
            onClick={handleLoadSampleFrd}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
            Mẫu FRD Markdown
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Ticket ID (VD: BNPL-945)"
              size="small"
              value={crCode}
              onChange={(e) => setCrCode(e.target.value)}
              sx={{ width: { xs: '100%', sm: '180px' } }}
            />
            <TextField
              label="CR Description (Tên CR)"
              size="small"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Usage Limit - Monthly 1 time synchronized update for user"
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              label="Column (Chủ đề CR)"
              size="small"
              fullWidth
              value={selectedColumnId}
              onChange={(e) => setSelectedColumnId(e.target.value)}>
              {(board?.columns || []).map(col => (
                <MenuItem key={col._id} value={col._id}>{col.title}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Sprint"
              size="small"
              fullWidth
              value={sprint}
              onChange={(e) => setSprint(e.target.value)}
              placeholder="Sprint 34"
            />

            <TextField
              select
              label="Status"
              size="small"
              fullWidth
              value={baStatus}
              onChange={(e) => setBaStatus(e.target.value)}>
              {BA_STATUS_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              size="small"
              fullWidth
              value={priority}
              onChange={(e) => setPriority(e.target.value)}>
              {PRIORITY_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.icon} {opt.label}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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

          <Box sx={{ p: 1.25, borderRadius: '10px', border: '1px dashed rgba(56, 189, 248, 0.35)' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
              👤 Handle by (Chọn nhanh thành viên chưa cần tài khoản):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, mb: 1 }}>
              {teamRoster.map(m => {
                const mName = typeof m === 'string' ? m : m?.name || ''
                if (!mName) return null
                const isSelected = selectedAssigneesList.some(
                  n => n.toLowerCase() === mName.toLowerCase()
                )
                return (
                  <Chip
                    key={mName}
                    label={isSelected ? `✓ ${mName}` : mName}
                    size="small"
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    onClick={() => handleToggleAssigneeChip(mName)}
                    sx={{ fontWeight: 700, cursor: 'pointer' }}
                  />
                )
              })}
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label="Handle by"
                size="small"
                fullWidth
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
              <TextField
                label="Tên file đính kèm"
                size="small"
                fullWidth
                value={uploadedFileName}
                onChange={(e) => setUploadedFileName(e.target.value)}
              />
            </Stack>
          </Box>

          <TextField
            label="Note (Ghi chú xuất ra báo cáo Excel Sprint)"
            size="small"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Đồng bộ hạn mức 1 lần/tháng cho user..."
          />

          <TextField
            label="Nội dung tài liệu Markdown (.MD) hoặc CSV Template (.CSV)"
            multiline
            minRows={7}
            maxRows={12}
            fullWidth
            value={markdownContent}
            onChange={(e) => applyParsedMarkdown(e.target.value, uploadedFileName)}
            placeholder="# [BNPL-945] Usage Limit - Monthly 1 time synchronized update for user&#10;- Ticket ID: BNPL-945&#10;- Sprint: Sprint 34&#10;- Handle by: Ho Thao Dieu, Hoang Vinh Son&#10;- Due date for dev: 05/11/2026"
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
                Đã phát hiện {parsedChecklist.length} hạng mục Subtask / UAT Checklist:
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
        <LoadingButton
          variant="contained"
          loading={isSubmitting}
          loadingLabel="Đang khởi tạo CR Ticket..."
          onClick={handleCreateTicketFromMarkdown}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px', px: 2.5 }}>
          {`Tạo CR Ticket [${crCode || 'CR'}] & Đính kèm FRD`}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default ImportMarkdownModal
