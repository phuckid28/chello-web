import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import EditNoteIcon from '@mui/icons-material/EditNote'
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'
import EastRoundedIcon from '@mui/icons-material/EastRounded'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { markdownBodySx } from '~/pages/KnowledgeHub/markdownStyles'
import {
  getCardResourceUsed,
  getStatusOption
} from '~/utils/excelExporter'
import {
  extractSprintNumberOnly,
  exportFrdAsPrintablePdf,
  parseSequenceDiagram
} from '~/utils/frdPdfExporter'

function SequenceDiagramRenderer({ code }) {
  const parsed = parseSequenceDiagram(code)
  if (!parsed) {
    return (
      <Box component="pre" sx={{ p: 1.5, borderRadius: '8px', overflowX: 'auto', fontSize: '0.8rem' }}>
        <code>{code}</code>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        my: 1.75,
        p: 2,
        borderRadius: '12px',
        border: '1px solid rgba(56, 189, 248, 0.32)',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(9, 13, 22, 0.85)' : '#f8fafc')
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
        <AccountTreeRoundedIcon sx={{ fontSize: 16, color: '#0284c7' }} />
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"JetBrains Mono", Consolas, monospace',
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: '#0284c7'
          }}
        >
          VISUAL SEQUENCE ARCHITECTURE FLOW
        </Typography>
      </Box>

      {/* Participant Nodes */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0.75,
          pb: 1.25,
          mb: 1.25,
          borderBottom: '1px dashed rgba(148, 163, 184, 0.35)'
        }}
      >
        {parsed.participants.map((p, idx) => (
          <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              size="small"
              label={p.label}
              sx={{
                fontWeight: 800,
                fontSize: '0.73rem',
                color: '#f8fafc',
                bgcolor: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.45)'
              }}
            />
            {idx < parsed.participants.length - 1 && (
              <EastRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Sequence Steps */}
      <Stack spacing={0.75}>
        {parsed.steps.map((step, idx) => {
          if (step.type === 'branch') {
            return (
              <Box
                key={`branch-${idx}`}
                sx={{
                  px: 1.25,
                  py: 0.4,
                  borderRadius: '6px',
                  bgcolor: 'rgba(56, 189, 248, 0.14)',
                  borderLeft: '3px solid #0284c7'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  [{step.keyword}] {step.label}
                </Typography>
              </Box>
            )
          }

          return (
            <Box
              key={`step-${idx}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.75,
                px: 1.25,
                py: 0.65,
                borderRadius: '8px',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : '#ffffff'),
                border: '1px solid rgba(148, 163, 184, 0.22)'
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'text.secondary',
                  minWidth: 22
                }}
              >
                {String(idx + 1).padStart(2, '0')}
              </Typography>
              <Chip
                size="small"
                label={step.from}
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
              <Typography component="span" sx={{ fontWeight: 800, color: step.dashed ? '#10b981' : '#0284c7' }}>
                {step.dashed ? '⇢' : '→'}
              </Typography>
              <Chip
                size="small"
                label={step.to}
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  ml: 0.5
                }}
              >
                {step.text}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

function FrdVisualDocument({
  card,
  markdownText,
  sprintNumber = '34',
  onEditClick,
  editButtonLabel = 'Chỉnh sửa',
  emptyPlaceholder = 'Chưa có mô tả chi tiết FRD. Nhấn vào đây hoặc nút Chèn mẫu FRD để khởi tạo tài liệu trực quan.'
}) {
  const [viewStyle, setViewStyle] = useState('visual') // 'visual' | 'pdf-sheet'
  const content = String(markdownText ?? card?.description ?? '').trim()
  const crCode = card?.crCode || 'BNPL-945'
  const cleanSprint = extractSprintNumberOnly(card?.sprint || sprintNumber, '34')
  const stOpt = getStatusOption(card?.baStatus)

  const isPdfSheet = viewStyle === 'pdf-sheet'

  return (
    <Box>
      {/* Document Viewer Control Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1.25,
          px: 1.5,
          py: 1,
          borderRadius: '10px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.82)' : '#f1f5f9'),
          border: '1px solid rgba(148, 163, 184, 0.24)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<DescriptionRoundedIcon fontSize="small" />}
            label={`FRD • ${crCode}`}
            color="info"
            sx={{ height: 22, fontFamily: '"JetBrains Mono", Consolas, monospace', fontWeight: 800, fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={`Sprint ${cleanSprint}`}
            variant="outlined"
            sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={stOpt.value}
            sx={{
              height: 22,
              fontWeight: 800,
              fontSize: '0.68rem',
              color: stOpt.color,
              bgcolor: `${stOpt.color}20`
            }}
          />
        </Box>

        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          <Button
            size="small"
            variant={isPdfSheet ? 'outlined' : 'contained'}
            color="info"
            startIcon={<ArticleRoundedIcon fontSize="small" />}
            onClick={() => setViewStyle(isPdfSheet ? 'visual' : 'pdf-sheet')}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', py: 0.3, borderRadius: '7px' }}
          >
            {isPdfSheet ? 'Xem chế độ Trực quan' : 'Xem trang A4 PDF'}
          </Button>

          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<PictureAsPdfRoundedIcon fontSize="small" />}
            onClick={() => exportFrdAsPrintablePdf(card, content, cleanSprint)}
            sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.74rem', py: 0.3, borderRadius: '7px' }}
          >
            Xuất / In PDF
          </Button>

          {onEditClick && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditNoteIcon fontSize="small" />}
              onClick={onEditClick}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.74rem', py: 0.3, borderRadius: '7px' }}
            >
              {editButtonLabel}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Rendered FRD Specification Surface */}
      <Box
        onDoubleClick={onEditClick}
        sx={{
          p: isPdfSheet ? { xs: 2.5, sm: 3.5 } : 2.25,
          borderRadius: '12px',
          border: isPdfSheet
            ? '1px solid #cbd5e1'
            : '1px solid rgba(148, 163, 184, 0.28)',
          bgcolor: isPdfSheet
            ? '#ffffff'
            : (theme) => (theme.palette.mode === 'dark' ? 'rgba(9, 13, 22, 0.72)' : '#ffffff'),
          color: isPdfSheet ? '#0f172a' : 'text.primary',
          boxShadow: isPdfSheet ? '0 10px 28px rgba(15, 23, 42, 0.14)' : 'none',
          maxHeight: 520,
          overflowY: 'auto'
        }}
      >
        {isPdfSheet && (
          <Box sx={{ pb: 1.5, mb: 2, borderBottom: '2px solid #0f172a' }}>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#0284c7'
              }}
            >
              CHELLA FUNCTIONAL REQUIREMENTS DOCUMENT (FRD • PDF SPEC SHEET)
            </Typography>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', mt: 0.25 }}>
              [{crCode}] {card?.title || 'Change Request Specification'}
            </Typography>
            <Divider sx={{ my: 1, borderColor: '#e2e8f0' }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.76rem', color: '#334155' }}>
              <span><strong>Sprint:</strong> {cleanSprint}</span>
              <span><strong>Status:</strong> {stOpt.value}</span>
              <span><strong>Handle by:</strong> {card?.assignee || 'Unassigned'}</span>
              <span><strong>Story Point:</strong> {getCardResourceUsed(card) || 1} pt</span>
            </Box>
          </Box>
        )}

        {content ? (
          <Box
            sx={{
              ...markdownBodySx,
              '& h1': { fontSize: '1.25rem', mt: 1, mb: 1 },
              '& h2': {
                fontSize: '1.02rem',
                mt: 2,
                mb: 0.75,
                pb: 0.4,
                borderBottom: '1px solid rgba(148, 163, 184, 0.28)'
              },
              '& h3': { fontSize: '0.94rem', mt: 1.5, mb: 0.5 },
              '& p': { my: 0.75, maxWidth: '100%' },
              ...(isPdfSheet ? {
                color: '#0f172a',
                '& th': { bgcolor: '#f1f5f9', color: '#0f172a', fontWeight: 800 },
                '& td, & th': { border: '1px solid #cbd5e1', px: 1.25, py: 0.75 },
                '& code': { bgcolor: '#f1f5f9', color: '#0f172a', px: 0.6, py: 0.15, borderRadius: '4px' }
              } : {})
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const raw = String(children || '').replace(/\n$/, '')
                  const isMermaid = /language-mermaid/.test(className || '') || raw.trim().startsWith('sequenceDiagram')
                  if (!inline && isMermaid) {
                    return <SequenceDiagramRenderer code={raw} />
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </Box>
        ) : (
          <Box
            onClick={onEditClick}
            sx={{
              py: 3,
              px: 2,
              textAlign: 'center',
              cursor: onEditClick ? 'pointer' : 'default',
              color: 'text.secondary'
            }}
          >
            <Typography variant="body2">{emptyPlaceholder}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default FrdVisualDocument
