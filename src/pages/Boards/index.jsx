import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { runWithReveal } from '~/fx/themeReveal'
import { fxBurst } from '~/fx/fxEvents'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fetchBoardsAPI, createNewBoardAPI } from '~/apis'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { useForm } from 'react-hook-form'
import { styled } from '@mui/material/styles'
import {
  ANIME_THEMES,
  ANIME_BOARD_TEMPLATES,
  SORA_PRESET_COVERS
} from '~/utils/animeTheme'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import {
  getDefaultTrackForTheme,
  isMusicBoxActive,
  playOstTrack,
  playUiChime
} from '~/utils/soundEffects'
import AwwwardsWorkspaceHero from './AwwwardsWorkspaceHero'
import { CreateBoardModal, ArtworkLightboxModal } from './CreateBoardModal'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  backgroundColor: theme.palette.mode === 'dark' ? 'var(--chella-raised-dark, #141824)' : 'var(--chella-raised-light, #ffffff)',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid var(--chella-border, rgba(148, 163, 184, 0.22))',
  transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : theme.palette.grey[100],
    transform: 'translateX(3px)'
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#38bdf8' : '#0284c7',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.14)' : '#f0f9ff',
    borderColor: 'var(--fx-accent, #38bdf8)'
  }
}))

const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

function Boards() {
  const [boards, setBoards] = useState(null)
  const [totalBoards, setTotalBoards] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [previewArt, setPreviewArt] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)

  const { globalPersonaKey, themeConfig, changePersona } = usePersonaTheme()
  const { t, tPrimary } = useTranslation()

  const location = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get('page') || '1', 10)

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: BOARD_TYPES.PUBLIC,
      theme: globalPersonaKey,
      useTemplate: true
    }
  })

  const updateStateData = (res) => {
    setBoards(res.boards || [])
    setTotalBoards(res.totalBoards || 0)
  }

  useEffect(() => {
    fetchBoardsAPI(location.search).then(updateStateData)
  }, [location.search])

  const handleOpenModal = () => {
    if (selectedTemplate) {
      reset({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        type: BOARD_TYPES.PUBLIC,
        theme: selectedTemplate.theme,
        useTemplate: true
      })
    }
    setIsOpenModal(true)
  }

  const handleCloseModal = () => {
    setIsOpenModal(false)
    reset()
  }

  const handleSwitchGlobalPersona = (themeKey, event) => {
    playUiChime('theme')
    if (event?.currentTarget) fxBurst(event.currentTarget, 14)
    runWithReveal(event, () => changePersona(themeKey))
    if (isMusicBoxActive()) {
      playOstTrack(getDefaultTrackForTheme(themeKey))
    }
  }

  const submitCreateNewBoard = (data) => {
    return createNewBoardAPI(data).then((createdBoard) => {
      handleCloseModal()
      if (createdBoard?._id) {
        navigate(`/boards/${createdBoard._id}`)
      } else {
        fetchBoardsAPI(location.search).then(updateStateData)
      }
    })
  }

  // Selecting a blueprint ONLY highlights it, switches the preview persona, and pre-fills the form — never auto-creates a board!
  const handleSelectTemplate = (tpl, event) => {
    setSelectedTemplate(tpl)
    handleSwitchGlobalPersona(tpl.theme, event)
    reset({
      title: tpl.title,
      description: tpl.description,
      type: BOARD_TYPES.PUBLIC,
      theme: tpl.theme,
      useTemplate: true
    })
  }

  // Explicit board creation triggered ONLY when the user clicks "Khởi tạo bảng Sprint" after selecting a template
  const handleConfirmCreateTemplate = (tpl) => {
    const targetTpl = tpl || selectedTemplate
    if (!targetTpl || isCreatingTemplate) return
    setIsCreatingTemplate(true)
    createNewBoardAPI({
      title: targetTpl.title,
      description: targetTpl.description,
      type: BOARD_TYPES.PUBLIC,
      theme: targetTpl.theme,
      useTemplate: true
    }).then((createdBoard) => {
      if (createdBoard?._id) {
        navigate(`/boards/${createdBoard._id}`)
      } else {
        fetchBoardsAPI(location.search).then(updateStateData)
      }
    }).finally(() => {
      setIsCreatingTemplate(false)
    })
  }

  if (!boards) {
    return <PageLoadingSpinner caption={tPrimary('loadingWorkspace')} />
  }

  const starredBoards = boards.filter(b => b.isStarred)

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => (theme.palette.mode === 'dark'
          ? 'var(--chella-ground-dark, #0b1120)'
          : 'var(--chella-ground-light, #f8fafc)')
      }}
    >
      <AppBar />

      {/* Awwwards Editorial Spread + Asymmetric Bento Telemetry + Interactive Blueprint Reel */}
      <AwwwardsWorkspaceHero
        themeConfig={themeConfig}
        globalPersonaKey={globalPersonaKey}
        totalBoards={totalBoards}
        starredCount={starredBoards.length}
        selectedTemplate={selectedTemplate}
        isCreatingTemplate={isCreatingTemplate}
        onSwitchPersona={handleSwitchGlobalPersona}
        onOpenCreateModal={handleOpenModal}
        onSelectTemplate={handleSelectTemplate}
        onConfirmCreateTemplate={handleConfirmCreateTemplate}
        t={t}
      />

      <Box sx={{ paddingX: { xs: 2, md: 4 }, my: 3 }}>
        <Grid container spacing={3}>
          <Grid xs={12} sm={3}>
            <Stack direction="column" spacing={1}>
              <SidebarItem className="active">
                <SpaceDashboardIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {t('allBoards')}
                </Typography>
              </SidebarItem>
              <SidebarItem onClick={handleOpenModal}>
                <LibraryAddIcon fontSize="small" color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {t('createNewSprintBoard')}
                </Typography>
              </SidebarItem>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', px: 1, display: 'block', mb: 1 }}>
              {t('templatesSidebarTitle')}
            </Typography>
            <Stack direction="column" spacing={1}>
              {ANIME_BOARD_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id
                return (
                  <SidebarItem
                    key={tpl.id}
                    className={isSelected ? 'active' : ''}
                    onClick={(e) => handleSelectTemplate(tpl, e)}
                  >
                    <SoraBunnyIcon fontSize="small" sx={{ flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {tpl.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                        {tpl.badge}
                      </Typography>
                    </Box>
                    {isSelected && <CheckCircleRoundedIcon fontSize="small" color="info" />}
                  </SidebarItem>
                )
              })}
              {selectedTemplate && (
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  disabled={isCreatingTemplate}
                  startIcon={<LibraryAddIcon fontSize="small" />}
                  onClick={() => handleConfirmCreateTemplate(selectedTemplate)}
                  sx={{ mt: 0.5, fontWeight: 800, textTransform: 'none', borderRadius: '10px' }}
                >
                  {isCreatingTemplate ? 'Đang khởi tạo...' : `${t('createNewSprintBoard')}: ${selectedTemplate.title.split(' ')[0]}`}
                </Button>
              )}
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* Theme & Artwork Gallery Widget */}
            <Card sx={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: `1px solid ${themeConfig.columnBorder}`,
              bgcolor: (theme) => (theme.palette.mode === 'dark'
                ? 'var(--chella-raised-dark, #131c31)'
                : 'var(--chella-raised-light, #ffffff)')
            }}>
              <Box sx={{
                height: 165,
                backgroundImage: `url(${themeConfig.mascotImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                p: 1.25
              }}>
                <Chip
                  icon={<SoraBunnyIcon fontSize="small" />}
                  label={themeConfig.characterName}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: 'white',
                    bgcolor: 'rgba(15, 23, 42, 0.78)',
                    backdropFilter: 'blur(6px)'
                  }}
                />
              </Box>
              <CardContent sx={{ p: 1.75, '&:last-child': { p: 1.75 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {t('themeGalleryTitle')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
                  {t('themeGallerySub')}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
                  {SORA_PRESET_COVERS.map((art) => (
                    <Box
                      key={art.key}
                      component="img"
                      src={art.url}
                      alt={art.label}
                      title={`${art.label} (${tPrimary('clickToEnlarge')})`}
                      onClick={() => {
                        playUiChime('sparkle')
                        setPreviewArt(art)
                      }}
                      sx={{
                        width: '100%',
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        transition: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.06)',
                          borderColor: themeConfig.accentColor
                        }
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} sm={9}>
            {starredBoards.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarRoundedIcon sx={{ color: '#fbbf24' }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                      {t('starredBoardsTitle')}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontWeight: 800,
                      color: 'text.secondary',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    FEATURED BENTO ({starredBoards.length})
                  </Typography>
                </Box>
                <Grid container spacing={2.5}>
                  {starredBoards.map((b, sIdx) => {
                    const bTheme = ANIME_THEMES[b.theme] || themeConfig
                    const isFeatured = sIdx === 0 && starredBoards.length > 1
                    return (
                      <Grid xs={12} sm={6} md={isFeatured ? 8 : 4} key={`starred-${b._id}`}>
                        <Card
                          component={Link}
                          to={`/boards/${b._id}`}
                          sx={{
                            display: 'block',
                            height: '100%',
                            textDecoration: 'none',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: `1px solid ${bTheme.accentColor}`,
                            transition: 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.24)'
                            }
                          }}
                        >
                          <Box sx={{
                            height: isFeatured ? '132px' : '112px',
                            position: 'relative',
                            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.72) 100%), url(${bTheme.heroImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            p: 1.5
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Chip
                                icon={<SoraBunnyIcon fontSize="small" />}
                                label={bTheme.element}
                                size="small"
                                sx={{ height: 22, fontSize: '11px', fontWeight: 700, color: 'white', bgcolor: 'rgba(15, 23, 42, 0.76)' }}
                              />
                              {bTheme.archetypeLabel && (
                                <Chip
                                  label={bTheme.archetypeLabel.split('•')[0].trim()}
                                  size="small"
                                  sx={{ height: 22, fontSize: '10px', fontWeight: 700, color: bTheme.accentColor, bgcolor: 'rgba(15, 23, 42, 0.82)' }}
                                />
                              )}
                            </Box>
                            <StarRoundedIcon fontSize="small" sx={{ color: '#fbbf24' }} />
                          </Box>
                          <CardContent sx={{ p: 2, '&:last-child': { p: 2 } }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.06rem', mb: 0.5 }} noWrap>
                              {b?.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {b?.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SoraRibbonIcon />
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {t('allBoards')} • Chella Sprint Boards
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"JetBrains Mono", Consolas, monospace',
                  fontWeight: 800,
                  color: 'text.secondary',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                ASYMMETRIC BENTO GRID
              </Typography>
            </Box>

            {boards?.length === 0 && (
              <Box sx={{
                p: 4,
                borderRadius: '16px',
                border: '1px dashed rgba(148, 163, 184, 0.4)',
                textAlign: 'center'
              }}>
                <SoraBunnyIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {t('noBoardsCreatedTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('noBoardsCreatedSub')}
                </Typography>
                <Button variant="contained" startIcon={<LibraryAddIcon />} onClick={handleOpenModal}>
                  {t('createNewSprintBoard')}
                </Button>
              </Box>
            )}

            {boards?.length > 0 && (
              <Grid container spacing={2.5}>
                {boards.map((b, idx) => {
                  const bTheme = ANIME_THEMES[b.theme] || themeConfig
                  const isHeroTile = idx === 0 && boards.length >= 3
                  const sprintIdx = String(idx + 1).padStart(2, '0')
                  return (
                    <Grid xs={12} sm={6} md={isHeroTile ? 8 : 4} key={b._id}>
                      <Card sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        bgcolor: (theme) => (theme.palette.mode === 'dark'
                          ? 'var(--chella-raised-dark, #131c31)'
                          : 'var(--chella-raised-light, #ffffff)'),
                        border: '1px solid var(--chella-border, rgba(148, 163, 184, 0.24))',
                        transition: 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s ease, box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          borderColor: bTheme.accentColor,
                          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.20)'
                        }
                      }}>
                        <Box sx={{
                          height: isHeroTile ? '136px' : '108px',
                          backgroundImage: `linear-gradient(180deg, rgba(9, 13, 22, 0.16) 0%, rgba(9, 13, 22, 0.76) 100%), url(${bTheme.heroImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          p: 1.5
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              sx={{
                                fontFamily: '"JetBrains Mono", Consolas, monospace',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                letterSpacing: '0.12em',
                                px: 0.9,
                                py: 0.25,
                                borderRadius: '6px',
                                color: bTheme.accentColor,
                                bgcolor: 'rgba(9, 13, 22, 0.78)',
                                fontVariantNumeric: 'tabular-nums'
                              }}
                            >
                              SPRINT {sprintIdx}
                            </Typography>
                            {b.isStarred && <StarRoundedIcon fontSize="small" sx={{ color: '#fbbf24' }} />}
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Chip
                              icon={<SoraBunnyIcon fontSize="small" />}
                              label={`${bTheme.element} • ${bTheme.name.split('•')[0].trim()}`}
                              size="small"
                              sx={{ height: 22, fontSize: '11px', fontWeight: 700, color: 'white', bgcolor: 'rgba(15, 23, 42, 0.76)' }}
                            />
                            {bTheme.jpTitle && isHeroTile && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: { xs: 'none', md: 'block' },
                                  color: 'rgba(248, 250, 252, 0.85)',
                                  fontWeight: 700,
                                  letterSpacing: '0.08em'
                                }}
                              >
                                {bTheme.jpTitle}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <CardContent sx={{ p: 2.25, '&:last-child': { p: 2.25 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 800, fontSize: isHeroTile ? '1.15rem' : '1.05rem', letterSpacing: '-0.015em' }} noWrap>
                              {b?.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                            >
                              {b?.description}
                            </Typography>
                          </Box>

                          <Box
                            component={Link}
                            to={`/boards/${b._id}`}
                            sx={{
                              mt: 2,
                              pt: 1.25,
                              borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontWeight: 800,
                              fontSize: '0.84rem',
                              textDecoration: 'none',
                              color: 'primary.main',
                              '&:hover': { color: 'primary.light' }
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontFamily: '"JetBrains Mono", Consolas, monospace',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: 'text.secondary'
                              }}
                            >
                              {bTheme.styleArchetype || 'ledger'}
                            </Typography>
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                              {t('openBoard')} <ArrowRightIcon fontSize="small" />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            )}

            {(totalBoards > 0) && (
              <Box sx={{ my: 4, pr: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Pagination
                  size="large"
                  color="primary"
                  showFirstButton
                  showLastButton
                  count={Math.ceil(totalBoards / DEFAULT_ITEMS_PER_PAGE)}
                  page={page}
                  renderItem={(item) => (
                    <PaginationItem
                      component={Link}
                      to={`/boards${item.page === DEFAULT_PAGE ? '' : `?page=${item.page}`}`}
                      {...item}
                    />
                  )}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      <CreateBoardModal
        isOpenModal={isOpenModal}
        onClose={handleCloseModal}
        themeConfig={themeConfig}
        globalPersonaKey={globalPersonaKey}
        boardTypes={BOARD_TYPES}
        control={control}
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={submitCreateNewBoard}
        errors={errors}
        isSubmitting={isSubmitting}
        t={t}
        tPrimary={tPrimary}
      />

      <ArtworkLightboxModal
        previewArt={previewArt}
        onClose={() => setPreviewArt(null)}
        themeConfig={themeConfig}
        tPrimary={tPrimary}
      />
    </Container>
  )
}

export default Boards
