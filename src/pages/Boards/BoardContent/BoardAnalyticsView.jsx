import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import { useDispatch } from 'react-redux'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { resolveCardCoverUrl, soraChibi } from '~/utils/animeTheme'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { playUiChime } from '~/utils/soundEffects'

function BoardAnalyticsView({ columns = [], themeConfig }) {
  const dispatch = useDispatch()

  const allRealCards = []
  columns.forEach((col) => {
    (col.cards || []).forEach((card) => {
      if (!card.FE_PlaceholderCard) {
        allRealCards.push({
          ...card,
          columnTitle: col.title
        })
      }
    })
  })

  let totalChecklistItems = 0
  let completedChecklistItems = 0
  let cardsWithCoverOrTags = 0

  allRealCards.forEach((card) => {
    const list = card.checklist || []
    totalChecklistItems += list.length
    completedChecklistItems += list.filter((i) => i.isCompleted).length
    if (card.cover || (card.labels && card.labels.length > 0)) {
      cardsWithCoverOrTags++
    }
  })

  const checklistPercent = totalChecklistItems > 0
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
    : 0

  const handleOpenCard = (card) => {
    playUiChime('sparkle')
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const glassCardSx = {
    borderRadius: '16px',
    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.86)' : 'rgba(255, 255, 255, 0.90)'),
    backdropFilter: 'blur(18px) saturate(160%)',
    border: `1px solid ${themeConfig.columnBorder}`,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
    animation: 'chelloFadeSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1)'
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        px: { xs: 2, md: 4 },
        py: 2
      }}
    >
      {/* Top Bento KPI Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                  TOTAL CARDS • 総カード数
                </Typography>
                <SoraBunnyIcon fontSize="small" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: themeConfig.accentColor }}>
                {allRealCards.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across {columns.length} workflow columns
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                  QUEST PROGRESS • 達成率
                </Typography>
                <SoraRibbonIcon fontSize="small" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#f472b6' }}>
                {checklistPercent}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={checklistPercent}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                  CHECKLIST ITEMS • 目標項目
                </Typography>
                <SoraBunnyIcon fontSize="small" />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {completedChecklistItems}/{totalChecklistItems}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed objectives in this board
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={soraChibi}
                alt="Chibi Sora"
                sx={{ width: 56, height: 56, border: `2px solid ${themeConfig.secondaryAccent}` }}
              />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>
                  STYLIZED CARDS • 装飾済み
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {cardsWithCoverOrTags}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  With Sora covers or tags
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Column Distribution Bento Card */}
        <Grid xs={12} md={4}>
          <Card sx={{ ...glassCardSx, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SoraRibbonIcon fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Stage Distribution • カラム別分布
                </Typography>
              </Box>
              <Stack spacing={2}>
                {columns.map((col) => {
                  const realCount = (col.cards || []).filter((c) => !c.FE_PlaceholderCard).length
                  const ratio = allRealCards.length > 0 ? Math.round((realCount / allRealCards.length) * 100) : 0
                  return (
                    <Box key={col._id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {col.title}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {realCount} cards ({ratio}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={ratio}
                        sx={{ height: 7, borderRadius: 4 }}
                      />
                    </Box>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Interactive Card Directory */}
        <Grid xs={12} md={8}>
          <Card sx={glassCardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SoraBunnyIcon fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Interactive Card Directory • 全カード一覧 (Click to open)
                  </Typography>
                </Box>
                <Chip
                  label={`${allRealCards.length} Total`}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              {allRealCards.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No cards match the current filter. Switch back to Kanban view to add cards!
                </Typography>
              )}

              <Stack spacing={1.25}>
                {allRealCards.map((card) => {
                  const coverUrl = resolveCardCoverUrl(card.cover)
                  const cTotal = card.checklist?.length || 0
                  const cDone = card.checklist?.filter((i) => i.isCompleted)?.length || 0
                  return (
                    <Box
                      key={card._id}
                      onClick={() => handleOpenCard(card)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 1.5,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: '1px solid rgba(148, 163, 184, 0.22)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          borderColor: themeConfig.accentColor,
                          bgcolor: (theme) => (
                            theme.palette.mode === 'dark' ? 'rgba(125, 211, 252, 0.08)' : 'rgba(2, 132, 199, 0.05)'
                          )
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                        {coverUrl ? (
                          <Avatar
                            variant="rounded"
                            src={coverUrl}
                            sx={{ width: 44, height: 44, borderRadius: '8px' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'rgba(125, 211, 252, 0.14)'
                            }}
                          >
                            <SoraBunnyIcon fontSize="small" />
                          </Box>
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>
                            {card.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.25 }}>
                            <Chip
                              label={card.columnTitle}
                              size="small"
                              variant="outlined"
                              sx={{ height: 19, fontSize: '0.68rem', fontWeight: 700 }}
                            />
                            {(card.labels || []).map((lbl) => (
                              <Chip
                                key={lbl.id}
                                label={lbl.title}
                                size="small"
                                sx={{
                                  height: 19,
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  color: 'white',
                                  bgcolor: lbl.color || '#0284c7'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>

                      {cTotal > 0 && (
                        <Chip
                          label={`${cDone}/${cTotal}`}
                          size="small"
                          color={cDone === cTotal ? 'success' : 'primary'}
                          sx={{ fontWeight: 800, height: 22 }}
                        />
                      )}
                    </Box>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default BoardAnalyticsView
