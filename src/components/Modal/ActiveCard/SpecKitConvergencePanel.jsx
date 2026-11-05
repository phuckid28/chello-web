import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded'
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded'
import { toast } from 'react-toastify'
import { SPEC_KIT_VERDICTS, auditCrConvergence, buildSddSpecSnippet } from '~/utils/specKitAudit'
import { playUiChime } from '~/utils/soundEffects'

const SEVERITY_COLORS = Object.freeze({
  CRITICAL: '#ef4444',
  HIGH: '#f59e0b',
  MEDIUM: '#38bdf8',
  LOW: '#94a3b8'
})

function SpecKitConvergencePanel({ card, onAppendSubtasks, onAppendDescription }) {
  const audit = useMemo(() => auditCrConvergence(card), [card])
  const { verdict, verdictMeta, score, uncertainties, spec, findings, remediationTasks } = audit

  const handleInsertSpecSnippet = async () => {
    if (!onAppendDescription) return
    const snippet = buildSddSpecSnippet(card)
    const nextDescription = card?.description
      ? `${card.description}\n\n---\n\n${snippet}`
      : snippet
    await onAppendDescription(nextDescription)
    playUiChime('sparkle')
    toast.success('🌱 Đã chèn khung đặc tả Spec-Kit (FR-### / SC-### / Given-When-Then)!')
  }

  const handleAppendConvergenceTasks = async () => {
    if (!onAppendSubtasks || remediationTasks.length === 0) return
    await onAppendSubtasks(remediationTasks)
    playUiChime('complete')
    toast.success(`🌱 Đã nối thêm ${remediationTasks.length} tác vụ Convergence vào Checklist!`)
  }

  return (
    <Box
      sx={{
        mb: 2.5,
        p: 1.75,
        borderRadius: '12px',
        border: `1px solid ${verdictMeta.color}55`,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.72)' : 'rgba(248, 250, 252, 0.92)')
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, flexWrap: 'wrap' }}>
          {verdict === SPEC_KIT_VERDICTS.CONVERGED ? (
            <VerifiedRoundedIcon sx={{ fontSize: 18, color: verdictMeta.color }} />
          ) : (
            <WarningAmberRoundedIcon sx={{ fontSize: 18, color: verdictMeta.color }} />
          )}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>
            🌱 Spec-Kit SDD &amp; Convergence Gate
          </Typography>
          <Chip
            size="small"
            label={`${verdictMeta.beacon} • ${verdictMeta.label} (${score}%)`}
            sx={{
              height: 22,
              fontFamily: '"JetBrains Mono", Consolas, monospace',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: verdictMeta.color,
              bgcolor: verdictMeta.bg,
              border: `1px solid ${verdictMeta.color}66`
            }}
          />
        </Box>

        <Stack direction="row" spacing={0.85} flexWrap="wrap">
          <Tooltip title="Chèn khung User Story (P1), Given/When/Then, FR-001, SC-001 theo chuẩn GitHub Spec Kit">
            <Button
              size="small"
              variant="outlined"
              startIcon={<NoteAddRoundedIcon />}
              onClick={handleInsertSpecSnippet}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', fontSize: '0.74rem' }}
            >
              Chèn chuẩn SDD Spec
            </Button>
          </Tooltip>
          {remediationTasks.length > 0 && (
            <Tooltip title="Append-only (/speckit-converge): Nối các tác vụ còn thiếu vào cuối Checklist mà không ghi đè mục cũ">
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<PlaylistAddCheckRoundedIcon />}
                onClick={handleAppendConvergenceTasks}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', fontSize: '0.74rem' }}
              >
                Append Convergence Tasks (+{remediationTasks.length})
              </Button>
            </Tooltip>
          )}
        </Stack>
      </Box>

      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 6,
          borderRadius: 3,
          mb: 1.25,
          bgcolor: 'rgba(148, 163, 184, 0.2)',
          '& .MuiLinearProgress-bar': { bgcolor: verdictMeta.color, borderRadius: 3 }
        }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: findings.length > 0 || uncertainties.length > 0 ? 1 : 0 }}>
        <Chip
          size="small"
          variant="outlined"
          label={`FR: ${spec.functionalRequirements.length} • SC: ${spec.successCriteria.length} • AC: ${spec.acceptanceScenarios.length}`}
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`FRD Docs: ${audit.frdCount}`}
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`Tasks: ${audit.checklistDone}/${audit.checklistTotal}`}
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}
        />
        {uncertainties.length > 0 && (
          <Chip
            size="small"
            label={`⚠️ ${uncertainties.length} [NEEDS CLARIFICATION]`}
            sx={{
              height: 20,
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#f59e0b',
              bgcolor: 'rgba(245, 158, 11, 0.16)'
            }}
          />
        )}
      </Box>

      {findings.length > 0 && (
        <Stack spacing={0.5}>
          {findings.map(f => {
            const sevColor = SEVERITY_COLORS[f.severity] || '#94a3b8'
            return (
              <Box
                key={f.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 1,
                  py: 0.45,
                  borderRadius: '6px',
                  bgcolor: 'rgba(15, 23, 42, 0.35)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <Chip
                    size="small"
                    label={f.severity}
                    sx={{
                      height: 17,
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      fontFamily: '"JetBrains Mono", monospace',
                      color: sevColor,
                      bgcolor: `${sevColor}22`
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {f.message}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    flexShrink: 0
                  }}
                >
                  {f.gapType}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}

export default SpecKitConvergencePanel
