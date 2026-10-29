import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import LoadingButton from '~/components/Loading/LoadingButton'
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
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fetchBoardsAPI, createNewBoardAPI } from '~/apis'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import Modal from '@mui/material/Modal'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import CancelIcon from '@mui/icons-material/Cancel'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import AbcIcon from '@mui/icons-material/Abc'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import Button from '@mui/material/Button'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useForm, Controller } from 'react-hook-form'
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { styled } from '@mui/material/styles'
import {
  ANIME_THEMES,
  PRIMARY_THEMES_LIST,
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

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  backgroundColor: theme.palette.mode === 'dark' ? '#141824' : '#fff',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : theme.palette.grey[100],
    transform: 'translateX(3px)'
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#7dd3fc' : '#0284c7',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(125, 211, 252, 0.14)' : '#f0f9ff',
    borderColor: '#7dd3fc'
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

  const handleOpenModal = () => setIsOpenModal(true)
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

  const handleQuickCreateTemplate = (tpl) => {
    handleSwitchGlobalPersona(tpl.theme)
    createNewBoardAPI({
      title: tpl.title,
      description: tpl.description,
      type: BOARD_TYPES.PUBLIC,
      theme: tpl.theme,
      useTemplate: true
    }).then((createdBoard) => {
      if (createdBoard?._id) {
        navigate(`/boards/${createdBoard._id}`)
      }
    })
  }

  if (!boards) {
    return <PageLoadingSpinner caption={tPrimary('loadingWorkspace')} />
  }

  const starredBoards = boards.filter(b => b.isStarred)

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />

      {/* Chella Multi-Theme Hero Banner */}
      <Box sx={{
        position: 'relative',
        mx: { xs: 2, md: 4 },
        mt: 3,
        mb: 4,
        p: { xs: 3, md: 4 },
        borderRadius: '18px',
        overflow: 'hidden',
        color: 'white',
        backgroundImage: `${themeConfig.boardOverlayDark}, url(${themeConfig.heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 14px 40px rgba(0, 0, 0, 0.32)',
        border: `1px solid ${themeConfig.accentColor}`
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={8}>
            <Chip
              icon={<SoraRibbonIcon fontSize="small" />}
              label='Chella — A clone of "C"onfluence - tr"ELL"o - jir"A"'
              size="small"
              sx={{
                mb: 1.5,
                maxWidth: '100%',
                bgcolor: 'rgba(15, 23, 42, 0.68)',
                color: '#f8fafc',
                border: `1px solid ${themeConfig.accentColor}`,
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 12px rgba(0,0,0,0.65)' }}>
              {themeConfig.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.94, fontStyle: 'italic', maxWidth: 680, mb: 2.5 }}>
              {themeConfig.quote}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {PRIMARY_THEMES_LIST.map((p) => (
                <Button
                  key={p.id}
                  size="small"
                  startIcon={<Avatar src={p.mascotImage} sx={{ width: 20, height: 20 }} />}
                  variant={globalPersonaKey === p.id ? 'contained' : 'outlined'}
                  onClick={(e) => handleSwitchGlobalPersona(p.id, e)}
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: p.accentColor,
                    bgcolor: globalPersonaKey === p.id ? p.accentColor : 'rgba(15, 23, 42, 0.58)',
                    backdropFilter: 'blur(6px)',
                    '&:hover': {
                      bgcolor: p.accentColor,
                      borderColor: 'white'
                    }
                  }}
                >
                  {p.name.split('•')[0].trim()} ({p.element})
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.25,
              borderRadius: '14px',
              bgcolor: 'rgba(15, 23, 42, 0.68)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${themeConfig.accentColor}`
            }}>
              <Avatar
                src={themeConfig.mascotImage}
                alt={themeConfig.characterName}
                sx={{ width: 54, height: 54, border: `2px solid ${themeConfig.accentColor}` }}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                  {themeConfig.characterName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.78)' }}>
                  Chella Companion • Sprint & CR Studio
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<LibraryAddIcon />}
              onClick={handleOpenModal}
              sx={{
                px: 3,
                py: 1.4,
                fontWeight: 800,
                textTransform: 'none',
                borderRadius: '12px',
                color: '#0f172a',
                background: `linear-gradient(135deg, #f8fafc 0%, ${themeConfig.accentColor} 55%, ${themeConfig.secondaryAccent} 100%)`,
                boxShadow: '0 8px 25px rgba(125, 211, 252, 0.45)',
                '&:hover': {
                  opacity: 0.94
                }
              }}
            >
              {t('createNewSprintBoard')}
            </Button>
          </Grid>
        </Grid>
      </Box>

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
              {ANIME_BOARD_TEMPLATES.map((tpl) => (
                <SidebarItem key={tpl.id} onClick={() => handleQuickCreateTemplate(tpl)}>
                  <SoraBunnyIcon fontSize="small" sx={{ flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                      {tpl.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                      {tpl.badge}
                    </Typography>
                  </Box>
                </SidebarItem>
              ))}
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* Theme & Artwork Gallery Widget */}
            <Card sx={{
              borderRadius: '14px',
              overflow: 'hidden',
              border: `1px solid ${themeConfig.columnBorder}`,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 27, 75, 0.85) 100%)'
                : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
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
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarRoundedIcon sx={{ color: '#fbbf24' }} />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {t('starredBoardsTitle')}
                  </Typography>
                </Box>
                <Grid container spacing={2.5}>
                  {starredBoards.map(b => {
                    const bTheme = ANIME_THEMES[b.theme] || themeConfig
                    return (
                      <Grid xs={12} sm={6} md={4} key={`starred-${b._id}`}>
                        <Card
                          component={Link}
                          to={`/boards/${b._id}`}
                          sx={{
                            display: 'block',
                            textDecoration: 'none',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            border: `1px solid ${bTheme.accentColor}`,
                            transition: 'all 0.22s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 12px 28px rgba(125, 211, 252, 0.28)'
                            }
                          }}
                        >
                          <Box sx={{
                            height: '104px',
                            position: 'relative',
                            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.68) 100%), url(${bTheme.heroImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            p: 1.25
                          }}>
                            <Chip
                              icon={<SoraBunnyIcon fontSize="small" />}
                              label={bTheme.element}
                              size="small"
                              sx={{ height: 22, fontSize: '11px', fontWeight: 700, color: 'white', bgcolor: 'rgba(15, 23, 42, 0.72)' }}
                            />
                            <StarRoundedIcon fontSize="small" sx={{ color: '#fbbf24' }} />
                          </Box>
                          <CardContent sx={{ p: 2, '&:last-child': { p: 2 } }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 0.5 }} noWrap>
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

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SoraRibbonIcon />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {t('allBoards')} • Chella Sprint Boards
              </Typography>
            </Box>

            {boards?.length === 0 &&
              <Box sx={{
                p: 4,
                borderRadius: '14px',
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
            }

            {boards?.length > 0 &&
              <Grid container spacing={2.5}>
                {boards.map(b => {
                  const bTheme = ANIME_THEMES[b.theme] || themeConfig
                  return (
                    <Grid xs={12} sm={6} md={4} key={b._id}>
                      <Card sx={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1px solid rgba(148, 163, 184, 0.24)',
                        transition: 'all 0.22s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          borderColor: bTheme.accentColor,
                          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.22)'
                        }
                      }}>
                        <Box sx={{
                          height: '100px',
                          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.68) 100%), url(${bTheme.heroImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          p: 1.25
                        }}>
                          <Chip
                            icon={<SoraBunnyIcon fontSize="small" />}
                            label={`${bTheme.element} • ${bTheme.name.split('•')[0].trim()}`}
                            size="small"
                            sx={{ height: 22, fontSize: '11px', fontWeight: 700, color: 'white', bgcolor: 'rgba(15, 23, 42, 0.72)' }}
                          />
                          {b.isStarred && <StarRoundedIcon fontSize="small" sx={{ color: '#fbbf24' }} />}
                        </Box>
                        <CardContent sx={{ p: 2, '&:last-child': { p: 2 } }}>
                          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1.05rem' }} noWrap>
                            {b?.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {b?.description}
                          </Typography>
                          <Box
                            component={Link}
                            to={`/boards/${b._id}`}
                            sx={{
                              mt: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              textDecoration: 'none',
                              color: 'primary.main',
                              '&:hover': { color: 'primary.light' }
                            }}>
                            {t('openBoard')} <ArrowRightIcon fontSize="small" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            }

            {(totalBoards > 0) &&
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
            }
          </Grid>
        </Grid>
      </Box>

      <Modal
        open={isOpenModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 660,
          maxWidth: '94vw',
          bgcolor: 'white',
          boxShadow: 24,
          borderRadius: '14px',
          border: `1px solid ${themeConfig.accentColor}`,
          outline: 0,
          padding: '24px 30px',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : 'white'
        }}>
          <Box sx={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            cursor: 'pointer'
          }}>
            <CancelIcon
              color="error"
              sx={{ '&:hover': { color: 'error.light' } }}
              onClick={handleCloseModal} />
          </Box>
          <Box id="modal-modal-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SoraBunnyIcon />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
              {t('createNewSprintBoard')} (Board = Sprint)
            </Typography>
          </Box>
          <Box id="modal-modal-description" sx={{ my: 2 }}>
            <form onSubmit={handleSubmit(submitCreateNewBoard)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <TextField
                    fullWidth
                    label={tPrimary('boardTitleInputLabel')}
                    type="text"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AbcIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('title', {
                      required: FIELD_REQUIRED_MESSAGE,
                      minLength: { value: 3, message: tPrimary('min3CharsMsg') },
                      maxLength: { value: 50, message: tPrimary('max50CharsMsg') }
                    })}
                    error={!!errors['title']}
                  />
                  <FieldErrorAlert errors={errors} fieldName={'title'} />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label={tPrimary('boardDescInputLabel')}
                    type="text"
                    variant="outlined"
                    multiline
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    {...register('description', {
                      required: FIELD_REQUIRED_MESSAGE,
                      minLength: { value: 3, message: tPrimary('min3CharsMsg') },
                      maxLength: { value: 256, message: tPrimary('max256CharsMsg') }
                    })}
                    error={!!errors['description']}
                  />
                  <FieldErrorAlert errors={errors} fieldName={'description'} />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    {t('selectThemeLabel')}:
                  </Typography>
                  <Controller
                    name="theme"
                    defaultValue={globalPersonaKey}
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        row
                        onChange={(event, value) => field.onChange(value)}
                        value={field.value}
                      >
                        <FormControlLabel
                          value="cosmos"
                          control={<Radio size="small" />}
                          label="🌌 Vũ Trụ & Hoàng Đạo (Cosmos)"
                        />
                        <FormControlLabel
                          value="wind-chime"
                          control={<Radio size="small" />}
                          label="🎐 Bầu Trời Xanh & Chuông Gió (Furin)"
                        />
                        <FormControlLabel
                          value="sora-sky"
                          control={<Radio size="small" />}
                          label="☁️ Sora (Distant Sky)"
                        />
                        <FormControlLabel
                          value="furina"
                          control={<Radio size="small" />}
                          label="💧 Furina (Fontaine Opera)"
                        />
                        <FormControlLabel
                          value="nahida"
                          control={<Radio size="small" />}
                          label="🌿 Nahida (Sumeru Wisdom)"
                        />
                        <FormControlLabel
                          value="sora-twilight"
                          control={<Radio size="small" />}
                          label="🎀 Sora (Moonlit Ribbon)"
                        />
                        <FormControlLabel
                          value="sora-usagi"
                          control={<Radio size="small" />}
                          label="🐰 Sora & Usagi Plush"
                        />
                      </RadioGroup>
                    )}
                  />
                </Box>

                <Controller
                  name="type"
                  defaultValue={BOARD_TYPES.PUBLIC}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      row
                      onChange={(event, value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControlLabel
                        value={BOARD_TYPES.PUBLIC}
                        control={<Radio size="small" />}
                        label={tPrimary('publicBoardRadio')}
                        labelPlacement="start"
                      />
                      <FormControlLabel
                        value={BOARD_TYPES.PRIVATE}
                        control={<Radio size="small" />}
                        label={tPrimary('privateBoardRadio')}
                        labelPlacement="start"
                      />
                    </RadioGroup>
                  )}
                />

                <Controller
                  name="useTemplate"
                  defaultValue={true}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(field.value)}
                          onChange={(e) => field.onChange(e.target.checked)}
                          size="small"
                        />
                      }
                      label={tPrimary('seedTemplateCheckboxLabel')}
                    />
                  )}
                />

                <Box sx={{ alignSelf: 'flex-end' }}>
                  <LoadingButton
                    className="interceptor-loading"
                    type="submit"
                    variant="contained"
                    color="primary"
                    loading={isSubmitting}
                  >
                    {t('createBoardSubmitBtn')}
                  </LoadingButton>
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Modal>

      {/* Full-Resolution Artwork Lightbox Modal */}
      <Modal open={Boolean(previewArt)} onClose={() => setPreviewArt(null)}>
        <Box
          onClick={() => setPreviewArt(null)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 820,
            maxWidth: '94vw',
            borderRadius: '18px',
            overflow: 'hidden',
            bgcolor: '#090d16',
            border: `1px solid ${themeConfig.accentColor}`,
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
            outline: 0,
            animation: 'chelloFadeSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {previewArt && (
            <>
              <Box
                component="img"
                src={previewArt.url}
                alt={previewArt.label}
                sx={{ width: '100%', maxHeight: '74vh', objectFit: 'contain', display: 'block', bgcolor: '#05070c' }}
              />
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SoraBunnyIcon />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {previewArt.label}
                  </Typography>
                </Box>
                <Chip
                  label={`${tPrimary('clickAnywhereToClose')} ${themeConfig.name}`}
                  size="small"
                  sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.14)', fontWeight: 700 }}
                />
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  )
}

export default Boards
