import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Unstable_Grid2'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { DEFAULT_SPRINT_CONFIG } from '~/utils/excelExporter'
import { extractSprintNumberOnly } from '~/utils/frdPdfExporter'

export function EditSprintBoardModal({
  open,
  board,
  onClose,
  onSave,
  saving
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('public')
  const [sprintNumber, setSprintNumber] = useState('34')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [goal, setGoal] = useState('')
  const [updatedBy, setUpdatedBy] = useState('')

  useEffect(() => {
    if (!board) return
    const cfg = { ...DEFAULT_SPRINT_CONFIG, ...(board.sprintConfig || {}) }
    const numOnly = extractSprintNumberOnly(cfg.sprintNumber || cfg.name) || '34'
    setTitle(board.title || '')
    setDescription(board.description || '')
    setType(board.type || 'public')
    setSprintNumber(numOnly)
    setStartDate(cfg.startDate || '')
    setEndDate(cfg.endDate || '')
    setGoal(cfg.goal || board.description || '')
    setUpdatedBy(cfg.updatedBy || 'Dao Thanh Phuc')
  }, [board])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!board || !title.trim() || title.trim().length < 3) return
    const cleanNum = extractSprintNumberOnly(sprintNumber) || '34'
    const currentCfg = { ...DEFAULT_SPRINT_CONFIG, ...(board.sprintConfig || {}) }
    const nextSprintConfig = {
      name: `Sprint ${cleanNum}`,
      sprintNumber: cleanNum,
      startDate: startDate.trim() || currentCfg.startDate,
      endDate: endDate.trim() || currentCfg.endDate,
      updateTill: currentCfg.updateTill || startDate.trim() || currentCfg.startDate,
      updatedBy: updatedBy.trim() || 'Dao Thanh Phuc',
      goal: goal.trim() || description.trim(),
      ...(currentCfg.teamRoster ? { teamRoster: currentCfg.teamRoster } : {})
    }
    onSave(board._id, {
      title: title.trim(),
      description: description.trim() || title.trim(),
      type,
      sprintConfig: nextSprintConfig
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditOutlinedIcon color="primary" fontSize="small" />
          Chỉnh sửa Bảng Sprint & Cấu hình Chu kỳ
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid xs={12} sm={8}>
              <TextField
                label="Tiêu đề Bảng Sprint"
                fullWidth
                size="small"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                inputProps={{ minLength: 3, maxLength: 50 }}
              />
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField
                label="Số Sprint (Chỉ nhập số)"
                fullWidth
                size="small"
                value={sprintNumber}
                onChange={(e) => setSprintNumber(extractSprintNumberOnly(e.target.value))}
                placeholder="VD: 34"
                inputProps={{ inputMode: 'numeric' }}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Mô tả Bảng Sprint"
                fullWidth
                size="small"
                multiline
                minRows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                inputProps={{ minLength: 3, maxLength: 256 }}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                label="Start date (DD/MM/YYYY)"
                fullWidth
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="22/10/2026"
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                label="End date (DD/MM/YYYY)"
                fullWidth
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="05/11/2026"
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                label="Người phụ trách cập nhật (By)"
                fullWidth
                size="small"
                value={updatedBy}
                onChange={(e) => setUpdatedBy(e.target.value)}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <Box sx={{ pt: 0.5 }}>
                <RadioGroup row value={type} onChange={(e) => setType(e.target.value)}>
                  <FormControlLabel value="public" control={<Radio size="small" />} label="Public" />
                  <FormControlLabel value="private" control={<Radio size="small" />} label="Private" />
                </RadioGroup>
              </Box>
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Mục tiêu kỳ Sprint (Sprint Goal)"
                fullWidth
                size="small"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 700 }}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || title.trim().length < 3}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export function DeleteSprintBoardDialog({
  open,
  board,
  onClose,
  onConfirm,
  deleting
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
        <DeleteOutlineRoundedIcon fontSize="small" />
        Xóa Bảng Sprint?
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Bạn có chắc chắn muốn xóa bảng Sprint <b>&ldquo;{board?.title}&rdquo;</b>?
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Hành động này sẽ xóa toàn bộ các cột Chủ đề CR, thẻ CR và trang tài liệu Knowledge Hub thuộc về bảng này.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 700 }}>
          Hủy
        </Button>
        <Button
          onClick={() => board && onConfirm(board)}
          variant="contained"
          color="error"
          disabled={deleting}
          sx={{ textTransform: 'none', fontWeight: 800 }}
        >
          {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
