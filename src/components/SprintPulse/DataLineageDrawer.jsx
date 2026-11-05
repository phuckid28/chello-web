import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded'
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded'
import StorageRoundedIcon from '@mui/icons-material/StorageRounded'
import { CHELLA_CATEGORICAL_PALETTE } from '~/utils/datavizPalette'
import { VERDICT_META } from '~/utils/specKitAudit'

function DataLineageDrawer({
  open,
  onClose,
  selectedKpi,
  lineage,
  onSelectKpi,
  onOpenCard
}) {
  const paletteAudit = lineage?.paletteAudit?.dark
  const kpiList = Object.values(lineage?.kpiById || {}).slice(0, 6)
  const activeKpi = selectedKpi || lineage?.kpiById?.total_crs || null
  const rows = activeKpi?.rows || []

  return (
    <Drawer
      anchor="right"
      open={Boolean(open)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 540, md: 620 },
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0b1120' : '#f8fafc'),
          backgroundImage: 'none',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageRoundedIcon color="info" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Sources &amp; Dataviz Lineage Inspector
            </Typography>
            <Typography variant="caption" color="text.secondary">
              claude-dashboard data-source attribution • dataviz OKLab/CVD verification
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close Sources Inspector">
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Quick KPI Selector */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {kpiList.map((kpi) => {
          const isSelected = activeKpi?.id === kpi.id
          return (
            <Chip
              key={kpi.id}
              label={`${kpi.title}: ${kpi.formattedValue}`}
              size="small"
              color={isSelected ? 'info' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => onSelectKpi?.(kpi.id)}
              sx={{ fontWeight: 700, cursor: 'pointer' }}
            />
          )
        })}
      </Box>

      {/* Active KPI Citation Receipt */}
      {activeKpi && (
        <Box
          sx={{
            p: 1.75,
            borderRadius: '12px',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.85)' : '#ffffff'),
            border: '1px solid rgba(56, 189, 248, 0.35)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38bdf8' }}>
              📌 {activeKpi.title}
            </Typography>
            <Chip
              size="small"
              label={activeKpi.formattedValue}
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 800,
                bgcolor: 'rgba(56, 189, 248, 0.16)',
                color: '#38bdf8'
              }}
            />
          </Box>

          <Stack spacing={0.4} sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.73rem' }}>
            <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
              • <strong>data-source</strong>: <code>{activeKpi.datasetId}</code>
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
              • <strong>data-field</strong>: <code>{activeKpi.field}</code>
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
              • <strong>data-where</strong>: <code>{activeKpi.whereClause}</code>
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
              • <strong>dash.calc</strong>: <code>{activeKpi.formula}</code>
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Traceable Source Rows Table */}
      <Box sx={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" sx={{ fontWeight: 800, mb: 0.75, color: 'text.secondary' }}>
          TRACED DATASET ROWS ({rows.length} matching records — click any row to inspect CR)
        </Typography>
        <TableContainer
          sx={{
            maxHeight: 280,
            borderRadius: '10px',
            border: '1px solid rgba(148, 163, 184, 0.24)'
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Ticket ID</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>CR Description</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Spec-Kit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Point</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                    0 matching rows in dataset for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const vMeta = VERDICT_META[row.convergenceVerdict] || VERDICT_META.partial
                  return (
                    <TableRow
                      key={row._id}
                      hover
                      onClick={() => {
                        if (row.rawCard && onOpenCard) {
                          onOpenCard(row.rawCard)
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '0.72rem' }}>
                        {row.crCode}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', maxWidth: 180 }} noWrap>
                        {row.title}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
                        {row.status}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.convergenceBeacon}
                          sx={{
                            height: 18,
                            fontSize: '0.62rem',
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 800,
                            color: vMeta.color,
                            bgcolor: vMeta.bg
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '0.72rem' }}>
                        {row.resourceUsed}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider />

      {/* Baoyu Dataviz OKLab & CVD Palette Audit */}
      {paletteAudit && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : '#ffffff'),
            border: '1px solid rgba(52, 211, 153, 0.35)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <PaletteRoundedIcon sx={{ fontSize: 18, color: '#34d399' }} />
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                BAOYU DATAVIZ PALETTE AUDIT (OKLab + Machado CVD)
              </Typography>
            </Box>
            <Chip
              size="small"
              icon={<FactCheckRoundedIcon sx={{ fontSize: '14px !important' }} />}
              label={paletteAudit.ok ? `PASS • CVD ΔE ${paletteAudit.worstCvdDeltaE}` : 'WARN'}
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 800,
                fontFamily: '"JetBrains Mono", monospace',
                color: '#10b981',
                bgcolor: 'rgba(16, 185, 129, 0.16)'
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.6, mb: 1 }}>
            {CHELLA_CATEGORICAL_PALETTE.dark.map((hex, idx) => (
              <Box
                key={hex}
                title={`Slot ${idx + 1}: ${hex}`}
                sx={{
                  flex: 1,
                  height: 18,
                  borderRadius: '4px',
                  bgcolor: hex,
                  border: '1px solid rgba(255,255,255,0.22)'
                }}
              />
            ))}
          </Box>

          <Stack spacing={0.35}>
            {paletteAudit.checks.map((chk) => (
              <Box key={chk.id} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {chk.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 800,
                    color: chk.status === 'pass' ? '#10b981' : '#f59e0b'
                  }}
                >
                  [{chk.status.toUpperCase()}] {chk.detail}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Button variant="outlined" size="small" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700 }}>
        Close Inspector
      </Button>
    </Drawer>
  )
}

export default DataLineageDrawer
