import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import RadarRoundedIcon from '@mui/icons-material/RadarRounded'
import { toast } from 'react-toastify'
import { requestSubtaskSuggestions } from '~/utils/crAssistant'
import { generateAiCrAssistanceAPI } from '~/apis'
import { useTranslation } from '~/customHooks/useTranslation'
import { playUiChime } from '~/utils/soundEffects'
import LoadingButton from '~/components/Loading/LoadingButton'

const GEMINI_MODEL_OPTIONS = [
  { value: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (Fast • Free Tier)' },
  { value: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Balanced • 1M ctx)' },
  { value: 'gemini-4-argon', label: 'Gemini 4 Argon (Deep Reasoning • Pro Tier)' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite (Ultra-Light)' },
  { value: 'gemma-4-31b-it', label: 'Gemma 4 31B IT (Open Model)' },
  { value: 'gemma-4-26b-a4b-it', label: 'Gemma 4 26B MoE (Open Model)' }
]

function CrAssistantPanel({
  card,
  boardCards = [],
  onAddItems,
  onApplyMarkdownToDescription,
  onAttachMarkdownAsFrd
}) {
  const { tPrimary, lang } = useTranslation()
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash-lite')
  const [aiBusyMode, setAiBusyMode] = useState('')
  const [aiMarkdown, setAiMarkdown] = useState('')
  const [aiMarkdownType, setAiMarkdownType] = useState('')
  const [lastModelInfo, setLastModelInfo] = useState(null)

  useEffect(() => {
    setOpen(false)
    setSuggestions([])
    setAiMarkdown('')
    setAiMarkdownType('')
    setLastModelInfo(null)
  }, [card?._id])

  const refreshLocal = async () => {
    setLoading(true)
    try {
      setSuggestions(await requestSubtaskSuggestions(card, { lang }))
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    playUiChime('sparkle')
    if (!open) await refreshLocal()
    setOpen((prev) => !prev)
  }

  const addAndDrop = async (items) => {
    if (!items.length) return
    await onAddItems(items.map((s) => s.title))
    const addedKeys = new Set(items.map((s) => s.key))
    setSuggestions((prev) => prev.filter((s) => !addedKeys.has(s.key)))
  }

  const buildBoardContextSummary = () => {
    return (boardCards || [])
      .filter((c) => c._id !== card?._id)
      .slice(0, 12)
      .map((c) => `- [${c.crCode || 'CR'}] ${c.title} (Status: ${c.baStatus || 'Processing'})`)
      .join('\n')
  }

  const handleRunGeminiAi = async (mode) => {
    if (!card?.title) return
    setAiBusyMode(mode)
    try {
      const res = await generateAiCrAssistanceAPI({
        mode,
        crCode: card.crCode || 'CR-001',
        title: card.title,
        description: card.description || '',
        baStatus: card.baStatus || 'Processing',
        sprint: card.sprint || 'Current Sprint',
        lang,
        model: selectedModel,
        boardContext: mode === 'conflict_check' ? buildBoardContextSummary() : ''
      })

      setLastModelInfo({
        modelUsed: res.modelUsed || selectedModel,
        fallbackFrom: res.fallbackFrom || null
      })
      playUiChime('complete')

      if (mode === 'subtasks' && Array.isArray(res.subtasks)) {
        const aiItems = res.subtasks.map((title, idx) => ({
          key: `ai-${Date.now()}-${idx}`,
          ruleId: 'gemini-ai',
          title: `✨ ${title}`
        }))
        setSuggestions((prev) => [...aiItems, ...prev])
        toast.success(`Gemini (${res.modelUsed}) đã sinh ${aiItems.length} hạng mục Subtask/UAT!`)
      } else if (res.markdown) {
        setAiMarkdown(res.markdown)
        setAiMarkdownType(mode)
        toast.success(
          mode === 'frd'
            ? `Gemini (${res.modelUsed}) đã soạn thảo xong tài liệu FRD!`
            : `Gemini (${res.modelUsed}) đã hoàn tất rà soát xung đột CR!`
        )
      }
    } catch (err) {
      // Handled by axios interceptor
    } finally {
      setAiBusyMode('')
    }
  }

  return (
    <Box sx={{ mt: 1.5 }}>
      <Button
        size="small"
        variant={open ? 'contained' : 'outlined'}
        color="secondary"
        startIcon={<AutoAwesomeRoundedIcon />}
        onClick={handleToggle}
        disabled={loading}
        sx={{ fontWeight: 700, borderRadius: '8px' }}
      >
        {tPrimary('assistantBtn')}
      </Button>
      <Collapse in={open} unmountOnExit>
        <Box
          sx={{
            mt: 1.25,
            p: 1.5,
            borderRadius: '12px',
            border: '1px dashed',
            borderColor: 'secondary.main',
            background: (theme) => (theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(244,114,182,0.08), rgba(125,211,252,0.06))'
              : 'linear-gradient(135deg, rgba(219,39,119,0.05), rgba(2,132,199,0.05))')
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {tPrimary('assistantTitle')}
              </Typography>
              {lastModelInfo && (
                <Tooltip
                  title={
                    lastModelInfo.fallbackFrom
                      ? `Tự động chuyển từ ${lastModelInfo.fallbackFrom} sang ${lastModelInfo.modelUsed} để tối ưu hạn mức Free Tier`
                      : `Đang sử dụng model ${lastModelInfo.modelUsed}`
                  }
                >
                  <Chip
                    size="small"
                    color="secondary"
                    label={`🤖 ${lastModelInfo.modelUsed}`}
                    sx={{ fontWeight: 700, height: 22 }}
                  />
                </Tooltip>
              )}
            </Box>
            <Button
              size="small"
              disabled={!suggestions.length}
              onClick={() => addAndDrop(suggestions)}
              sx={{ fontWeight: 700 }}
            >
              {tPrimary('assistantAddAll')}
            </Button>
          </Box>

          {/* Gemini AI Model Picker & Action Bar */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1.5, p: 1, borderRadius: '10px', bgcolor: 'action.hover' }}
          >
            <TextField
              select
              size="small"
              label="Gemini AI Model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 240 } }}
            >
              {GEMINI_MODEL_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <LoadingButton
              size="small"
              variant="contained"
              color="secondary"
              loading={aiBusyMode === 'subtasks'}
              loadingLabel="Đang phân tích..."
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={() => handleRunGeminiAi('subtasks')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', whiteSpace: 'nowrap' }}
            >
              AI Gợi ý Subtasks
            </LoadingButton>

            <LoadingButton
              size="small"
              variant="outlined"
              color="primary"
              loading={aiBusyMode === 'frd'}
              loadingLabel="Đang soạn FRD..."
              startIcon={<DescriptionRoundedIcon />}
              onClick={() => handleRunGeminiAi('frd')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', whiteSpace: 'nowrap' }}
            >
              AI Viết FRD
            </LoadingButton>

            <LoadingButton
              size="small"
              variant="outlined"
              color="warning"
              loading={aiBusyMode === 'conflict_check'}
              loadingLabel="Đang rà soát..."
              startIcon={<RadarRoundedIcon />}
              onClick={() => handleRunGeminiAi('conflict_check')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', whiteSpace: 'nowrap' }}
            >
              AI Rà Xung đột
            </LoadingButton>
          </Stack>

          {aiMarkdown && (
            <Box
              sx={{
                mb: 1.5,
                p: 1.25,
                borderRadius: '10px',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                bgcolor: 'background.paper'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {aiMarkdownType === 'frd'
                    ? '📄 Bản thảo FRD do Gemini AI biên soạn:'
                    : '🔍 Báo cáo rà soát xung đột & phụ thuộc CR:'}
                </Typography>
                <Stack direction="row" spacing={0.75}>
                  {onApplyMarkdownToDescription && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        onApplyMarkdownToDescription(aiMarkdown)
                        toast.success('Đã nạp nội dung AI vào khung Đặc tả FRD của thẻ!')
                      }}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', py: 0.25 }}
                    >
                      Nạp vào Mô tả CR
                    </Button>
                  )}
                  {onAttachMarkdownAsFrd && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const fileName = aiMarkdownType === 'frd'
                          ? `FRD_${card?.crCode || 'CR'}_Gemini.md`
                          : `Conflict_Analysis_${card?.crCode || 'CR'}.md`
                        onAttachMarkdownAsFrd(fileName, aiMarkdown)
                      }}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', py: 0.25 }}
                    >
                      Lưu thành file FRD (.MD)
                    </Button>
                  )}
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => setAiMarkdown('')}
                    sx={{ textTransform: 'none', fontSize: '0.74rem', py: 0.25 }}
                  >
                    Ẩn
                  </Button>
                </Stack>
              </Box>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1,
                  maxHeight: 220,
                  overflowY: 'auto',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  borderRadius: '8px',
                  bgcolor: 'action.hover'
                }}
              >
                {aiMarkdown}
              </Box>
            </Box>
          )}

          {suggestions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{tPrimary('assistantEmpty')}</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {suggestions.map((s, idx) => (
                <Chip
                  key={s.key}
                  icon={<AddRoundedIcon />}
                  label={s.title}
                  onClick={() => addAndDrop([s])}
                  variant="outlined"
                  sx={{
                    justifyContent: 'flex-start',
                    height: 'auto',
                    py: 0.5,
                    fontWeight: 600,
                    '& .MuiChip-label': { whiteSpace: 'normal' },
                    borderColor: s.ruleId === 'base' ? 'divider' : 'secondary.main',
                    animation: `chelloFadeSlideUp 0.28s ease ${idx * 0.04}s both`
                  }}
                />
              ))}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {tPrimary('assistantHint')}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  )
}

export default CrAssistantPanel
