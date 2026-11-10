import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { SoraBunnyIcon } from '~/components/Icons/SoraBunnyIcon'
import { extractSprintNumberOnly } from '~/utils/frdPdfExporter'

function SprintBoardCard({
  board: b,
  idx,
  isHeroTile = false,
  activeBoardId,
  themeConfig,
  t,
  onToggleStar,
  onEdit,
  onDelete,
  onOpenCardMenu,
  onOpenBoardInView,
  onOpenWiki
}) {
  const sprintIdx = extractSprintNumberOnly(b?.sprintConfig?.sprintNumber || b?.title) || String(idx + 1).padStart(2, '0')
  const isPinnedCurrent = b._id === activeBoardId

  const handleCardPointerMove = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${Math.round(e.clientX - rect.left)}px`)
    el.style.setProperty('--spot-y', `${Math.round(e.clientY - rect.top)}px`)
  }

  return (
    <Card
      className='chella-interactive-surface'
      onMouseMove={handleCardPointerMove}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '16px',
        overflow: 'hidden',
        bgcolor: (theme) => (theme.palette.mode === 'dark'
          ? 'var(--chella-raised-dark, #131c31)'
          : 'var(--chella-raised-light, #ffffff)'),
        border: isPinnedCurrent
          ? `2px solid ${themeConfig.accentColor}`
          : '1px solid var(--chella-border, rgba(148, 163, 184, 0.24))',
        transition: 'transform 0.24s var(--chella-spring-curve, cubic-bezier(0.22, 1, 0.36, 1)), border-color 0.22s ease, box-shadow 0.24s var(--chella-spring-curve, cubic-bezier(0.22, 1, 0.36, 1))',
        '&:hover': {
          transform: 'translateY(var(--chella-card-lift, -3px))',
          borderColor: themeConfig.accentColor,
          boxShadow: (theme) => (theme.palette.mode === 'dark'
            ? 'var(--chella-card-hover-shadow-dark, 0 14px 32px rgba(0, 0, 0, 0.45))'
            : 'var(--chella-card-hover-shadow-light, 0 12px 28px rgba(0, 0, 0, 0.16))')
        }
      }}
    >
      <Box
        sx={{
          height: isHeroTile ? '132px' : '112px',
          backgroundImage: `linear-gradient(180deg, rgba(9, 13, 22, 0.26) 0%, rgba(9, 13, 22, 0.82) 100%), url(${themeConfig.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 1.35
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", Consolas, monospace',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                px: 0.85,
                py: 0.25,
                borderRadius: '6px',
                color: themeConfig.accentColor,
                bgcolor: 'rgba(9, 13, 22, 0.82)',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              SPRINT {sprintIdx}
            </Typography>
            {isPinnedCurrent && (
              <Chip
                size='small'
                label='Hiện tại'
                sx={{
                  height: 20,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  bgcolor: themeConfig.accentColor
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
            <Tooltip title={b.isStarred ? 'Bỏ đánh dấu sao' : 'Đánh dấu sao'}>
              <IconButton
                size='small'
                onClick={(e) => onToggleStar(b, e)}
                sx={{
                  width: 26,
                  height: 26,
                  color: b.isStarred ? '#fbbf24' : 'rgba(255,255,255,0.85)',
                  bgcolor: 'rgba(9, 13, 22, 0.68)',
                  '&:hover': { bgcolor: 'rgba(9, 13, 22, 0.92)' }
                }}
              >
                {b.isStarred ? <StarRoundedIcon sx={{ fontSize: 16 }} /> : <StarBorderRoundedIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title='Chỉnh sửa thông tin & Chu kỳ Sprint'>
              <IconButton
                size='small'
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit(b)
                }}
                sx={{
                  width: 26,
                  height: 26,
                  color: 'white',
                  bgcolor: 'rgba(9, 13, 22, 0.68)',
                  '&:hover': { bgcolor: 'rgba(9, 13, 22, 0.92)', color: themeConfig.accentColor }
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title='Xóa Bảng Sprint'>
              <IconButton
                size='small'
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(b)
                }}
                sx={{
                  width: 26,
                  height: 26,
                  color: 'rgba(252, 165, 165, 0.95)',
                  bgcolor: 'rgba(9, 13, 22, 0.68)',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.85)', color: 'white' }
                }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title='Công cụ mở rộng (Nhân bản, Xuất Excel, Chuyển View...)'>
              <IconButton
                size='small'
                onClick={(e) => onOpenCardMenu(e, b)}
                sx={{
                  width: 26,
                  height: 26,
                  color: 'white',
                  bgcolor: 'rgba(9, 13, 22, 0.68)',
                  '&:hover': { bgcolor: 'rgba(9, 13, 22, 0.92)' }
                }}
              >
                <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Chip
            icon={<SoraBunnyIcon fontSize='small' />}
            label={b?.sprintConfig?.startDate && b?.sprintConfig?.endDate
              ? `${b.sprintConfig.startDate} → ${b.sprintConfig.endDate}`
              : 'Unified Sprint • Matrix & Kanban'}
            size='small'
            sx={{ height: 22, fontSize: '10.5px', fontWeight: 700, color: 'white', bgcolor: 'rgba(15, 23, 42, 0.78)' }}
          />
          <Chip
            label={b.type === 'private' ? 'Private' : 'Public'}
            size='small'
            sx={{
              height: 20,
              fontSize: '10px',
              fontWeight: 700,
              color: b.type === 'private' ? '#fca5a5' : '#6ee7b7',
              bgcolor: 'rgba(15, 23, 42, 0.82)'
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: 2, '&:last-child': { p: 2 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            gutterBottom
            variant='h6'
            component={Link}
            to={`/boards/${b._id}`}
            sx={{
              display: 'block',
              fontWeight: 800,
              fontSize: isHeroTile ? '1.12rem' : '1.02rem',
              letterSpacing: '-0.015em',
              textDecoration: 'none',
              color: 'text.primary',
              '&:hover': { color: 'primary.main' }
            }}
            noWrap
          >
            {b?.title}
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {b?.description}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 1.75,
            pt: 1.15,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.75,
            flexWrap: 'wrap'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Tooltip title='Mở Sprint Matrix'>
              <Chip
                size='small'
                label='Matrix'
                onClick={() => onOpenBoardInView(b._id, 'overview')}
                clickable
                sx={{ height: 22, fontSize: '0.66rem', fontWeight: 800 }}
              />
            </Tooltip>
            <Tooltip title='Mở Kanban Board'>
              <Chip
                size='small'
                label='Kanban'
                onClick={() => onOpenBoardInView(b._id, 'kanban')}
                clickable
                sx={{ height: 22, fontSize: '0.66rem', fontWeight: 700 }}
              />
            </Tooltip>
            <Tooltip title='Mở Knowledge Hub (Wiki)'>
              <Chip
                size='small'
                label='Wiki'
                onClick={() => onOpenWiki(b._id)}
                clickable
                sx={{ height: 22, fontSize: '0.66rem', fontWeight: 700 }}
              />
            </Tooltip>
          </Box>

          <Box
            component={Link}
            to={`/boards/${b._id}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              fontWeight: 800,
              fontSize: '0.82rem',
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': { color: 'primary.light' }
            }}
          >
            {t('openBoard')} <ArrowRightIcon fontSize='small' />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SprintBoardCard
