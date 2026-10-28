import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
import { ANIME_THEMES, ANIME_BOARD_TEMPLATES } from '~/utils/animeTheme'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[200],
    transform: 'translateX(3px)'
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#38bdf8' : '#0c66e4',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.14)' : '#e9f2ff',
    borderColor: '#38bdf8'
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

  const { globalPersonaKey, themeConfig, changePersona } = usePersonaTheme()

  const location = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get('page') || '1', 10)

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm({
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

  const submitCreateNewBoard = (data) => {
    createNewBoardAPI(data).then((createdBoard) => {
      handleCloseModal()
      if (createdBoard?._id) {
        navigate(`/boards/${createdBoard._id}`)
      } else {
        fetchBoardsAPI(location.search).then(updateStateData)
      }
    })
  }

  const handleQuickCreateTemplate = (tpl) => {
    changePersona(tpl.theme)
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
    return <PageLoadingSpinner caption="Synchronizing Akasha & Fontaine Boards..." />
  }

  const starredBoards = boards.filter(b => b.isStarred)

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />

      {/* Furina & Nahida Anime Hero Banner */}
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
        boxShadow: '0 14px 40px rgba(0, 0, 0, 0.28)',
        border: `1px solid ${themeConfig.accentColor}`
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={8}>
            <Chip
              label={`${themeConfig.jpTitle} • ${themeConfig.element}`}
              size="small"
              sx={{
                mb: 1.5,
                bgcolor: 'rgba(255, 255, 255, 0.16)',
                color: '#fde047',
                fontWeight: 700,
                backdropFilter: 'blur(6px)'
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {themeConfig.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.92, fontStyle: 'italic', maxWidth: 680, mb: 2 }}>
              {themeConfig.quote}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.values(ANIME_THEMES).map((p) => (
                <Button
                  key={p.id}
                  size="small"
                  variant={globalPersonaKey === p.id ? 'contained' : 'outlined'}
                  onClick={() => changePersona(p.id)}
                  sx={{
                    color: 'white',
                    borderColor: p.accentColor,
                    bgcolor: globalPersonaKey === p.id ? p.accentColor : 'rgba(0,0,0,0.35)',
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
          <Grid xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LibraryAddIcon />}
              onClick={handleOpenModal}
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 800,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #10b981 100%)',
                boxShadow: '0 8px 25px rgba(56, 189, 248, 0.45)'
              }}
            >
              Create Anime Board
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
                All Boards • ボード
              </SidebarItem>
              <SidebarItem onClick={handleOpenModal}>
                <LibraryAddIcon fontSize="small" color="primary" />
                Create New Board • 新規作成
              </SidebarItem>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', px: 1, display: 'block', mb: 1 }}>
              1-CLICK ANIME TEMPLATES • テンプレート
            </Typography>
            <Stack direction="column" spacing={1}>
              {ANIME_BOARD_TEMPLATES.map((tpl) => (
                <SidebarItem key={tpl.id} onClick={() => handleQuickCreateTemplate(tpl)}>
                  <AutoAwesomeIcon fontSize="small" sx={{ color: '#fbbf24' }} />
                  <Box sx={{ overflow: 'hidden' }}>
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
          </Grid>

          <Grid xs={12} sm={9}>
            {starredBoards.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarRoundedIcon sx={{ color: '#fbbf24' }} />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Starred Boards • お気に入り
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
                              boxShadow: '0 12px 28px rgba(56, 189, 248, 0.28)'
                            }
                          }}
                        >
                          <Box sx={{
                            height: '96px',
                            position: 'relative',
                            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%), url(${bTheme.heroImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            p: 1.25
                          }}>
                            <Chip
                              label={bTheme.element}
                              size="small"
                              sx={{ height: 20, fontSize: '11px', fontWeight: 700, color: 'white', bgcolor: 'rgba(0,0,0,0.55)' }}
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

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Your Workspaces & Boards • すべてのボード
            </Typography>

            {boards?.length === 0 &&
              <Box sx={{
                p: 4,
                borderRadius: '14px',
                border: '1px dashed rgba(148, 163, 184, 0.4)',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  No boards found yet!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start with a 1-click Furina or Nahida template on the left, or create a custom board.
                </Typography>
                <Button variant="contained" startIcon={<LibraryAddIcon />} onClick={handleOpenModal}>
                  Create Your First Board
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
                        border: '1px solid rgba(148, 163, 184, 0.22)',
                        transition: 'all 0.22s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          borderColor: bTheme.accentColor,
                          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)'
                        }
                      }}>
                        <Box sx={{
                          height: '92px',
                          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.62) 100%), url(${bTheme.heroImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          p: 1.25
                        }}>
                          <Chip
                            label={`${bTheme.element} • ${bTheme.name.split('•')[0].trim()}`}
                            size="small"
                            sx={{ height: 20, fontSize: '11px', fontWeight: 700, color: 'white', bgcolor: 'rgba(0,0,0,0.55)' }}
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
                            Enter Realm <ArrowRightIcon fontSize="small" />
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
          width: 600,
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
            <LibraryAddIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
              Create New Anime Board • 新規ボード作成
            </Typography>
          </Box>
          <Box id="modal-modal-description" sx={{ my: 2 }}>
            <form onSubmit={handleSubmit(submitCreateNewBoard)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Board Title"
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
                      minLength: { value: 3, message: 'Min Length is 3 characters' },
                      maxLength: { value: 50, message: 'Max Length is 50 characters' }
                    })}
                    error={!!errors['title']}
                  />
                  <FieldErrorAlert errors={errors} fieldName={'title'} />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Description"
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
                      minLength: { value: 3, message: 'Min Length is 3 characters' },
                      maxLength: { value: 256, message: 'Max Length is 256 characters' }
                    })}
                    error={!!errors['description']}
                  />
                  <FieldErrorAlert errors={errors} fieldName={'description'} />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Select Archon Theme • テーマ:
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
                          value="furina"
                          control={<Radio size="small" />}
                          label="💧 Furina (Hydro)"
                        />
                        <FormControlLabel
                          value="nahida"
                          control={<Radio size="small" />}
                          label="🌿 Nahida (Dendro)"
                        />
                        <FormControlLabel
                          value="celestia"
                          control={<Radio size="small" />}
                          label="✨ Celestia (Bloom)"
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
                        label="Public"
                        labelPlacement="start"
                      />
                      <FormControlLabel
                        value={BOARD_TYPES.PRIVATE}
                        control={<Radio size="small" />}
                        label="Private"
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
                      label="Auto-populate starter anime columns, covers & quest checklist"
                    />
                  )}
                />

                <Box sx={{ alignSelf: 'flex-end' }}>
                  <Button
                    className="interceptor-loading"
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Create Board
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Box>
      </Modal>
    </Container>
  )
}

export default Boards
