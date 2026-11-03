import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded'
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  fetchBoardsAPI,
  createNewBoardAPI,
  updateBoardDetailsAPI,
  deleteBoardDetailsAPI,
  fetchBoardDetailsDirectAPI
} from '~/apis'
import {
  selectCurrentWorkspaceId,
  selectCurrentWorkspace
} from '~/redux/workspaces/workspacesSlice'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { useForm } from 'react-hook-form'
import { styled } from '@mui/material/styles'
import { DEFAULT_SPRINT_TEMPLATE } from '~/utils/animeTheme'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { SoraBunnyIcon, SoraRibbonIcon } from '~/components/Icons/SoraBunnyIcon'
import { playUiChime } from '~/utils/soundEffects'
import { persistBoardView } from '~/utils/boardEvents'
import { exportSprintCrsToExcel, exportSprintCrsToCsv } from '~/utils/excelExporter'
import { extractSprintNumberOnly } from '~/utils/frdPdfExporter'
import AwwwardsWorkspaceHero from './AwwwardsWorkspaceHero'
import SprintCommandDashboard from './SprintCommandDashboard'
import { CreateBoardModal } from './CreateBoardModal'
import { EditSprintBoardModal, DeleteSprintBoardDialog } from './BoardCardToolsDialog'
import WorkspaceSidebarSection from './WorkspaceSidebarSection'
import SprintBoardCard from './SprintBoardCard'
import BoardCardContextMenu from './BoardCardContextMenu'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  backgroundColor: theme.palette.mode === 'dark' ? 'var(--chella-raised-dark, #141824)' : 'var(--chella-raised-light, #ffffff)',
  padding: '11px 14px',
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

const PINNED_SPRINT_STORAGE_KEY = 'chella_pinned_current_sprint_id'

function Boards() {
  const [boards, setBoards] = useState(null)
  const [totalBoards, setTotalBoards] = useState(null)
  const [isOpenModal, setIsOpenModal] = useState(false)

  const currentWorkspaceId = useSelector(selectCurrentWorkspaceId)
  const currentWorkspace = useSelector(selectCurrentWorkspace)

  // Current Active Sprint Dashboard state
  const [activeBoardId, setActiveBoardId] = useState(() => {
    try {
      return localStorage.getItem(PINNED_SPRINT_STORAGE_KEY) || null
    } catch (e) {
      return null
    }
  })
  const [activeBoardDetails, setActiveBoardDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Board List Filter, Search & Tools state
  const [boardFilter, setBoardFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingBoard, setEditingBoard] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingBoard, setDeletingBoard] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuBoard, setMenuBoard] = useState(null)

  const { globalPersonaKey, themeConfig } = usePersonaTheme()
  const { t, tPrimary, formatMessage } = useTranslation()

  const location = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get('page') || '1', 10)

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: BOARD_TYPES.PUBLIC,
      useTemplate: true
    }
  })

  const updateStateData = useCallback((res) => {
    const list = res.boards || []
    setBoards(list)
    setTotalBoards(res.totalBoards || 0)
    if (list.length > 0) {
      setActiveBoardId((prevId) => {
        if (prevId && list.some(b => b._id === prevId)) return prevId
        const starred = list.find(b => b.isStarred)
        return (starred || list[0])._id
      })
    } else {
      setActiveBoardId(null)
      setActiveBoardDetails(null)
    }
  }, [])

  useEffect(() => {
    fetchBoardsAPI(location.search).then(updateStateData)
  }, [location.search, updateStateData])

  // Load full details (columns, CR cards, deadlines) for the currently selected Sprint board
  useEffect(() => {
    if (!activeBoardId) return
    let cancelled = false
    setLoadingDetails(true)
    fetchBoardDetailsDirectAPI(activeBoardId)
      .then((details) => {
        if (!cancelled) setActiveBoardDetails(details)
      })
      .catch(() => {
        if (!cancelled) setActiveBoardDetails(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeBoardId])

  const handleSelectActiveBoardId = (boardId) => {
    playUiChime('sparkle')
    setActiveBoardId(boardId)
    try {
      localStorage.setItem(PINNED_SPRINT_STORAGE_KEY, boardId)
    } catch (e) {
      // Ignore storage errors
    }
  }

  const handleOpenModalWithTemplate = useCallback((prefillTemplate = false) => {
    const nextSprintNum = (totalBoards || 0) + 1
    if (prefillTemplate) {
      reset({
        title: `Sprint ${nextSprintNum} • Quản lý CR & FRD`,
        description: DEFAULT_SPRINT_TEMPLATE.description,
        type: BOARD_TYPES.PUBLIC,
        useTemplate: true
      })
    } else {
      reset({
        title: '',
        description: '',
        type: BOARD_TYPES.PUBLIC,
        useTemplate: true
      })
    }
    setIsOpenModal(true)
  }, [reset, totalBoards])

  useEffect(() => {
    const handleOpenFromMenu = () => handleOpenModalWithTemplate(true)
    window.addEventListener('chello-open-create-board-modal', handleOpenFromMenu)
    return () => window.removeEventListener('chello-open-create-board-modal', handleOpenFromMenu)
  }, [handleOpenModalWithTemplate])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('create') === '1' && boards !== null) {
      handleOpenModalWithTemplate(true)
      params.delete('create')
      const rest = params.toString()
      navigate(`/boards${rest ? `?${rest}` : ''}`, { replace: true })
    }
  }, [location.search, boards, handleOpenModalWithTemplate, navigate])

  const handleOpenModal = () => handleOpenModalWithTemplate(false)

  const handleCloseModal = () => {
    setIsOpenModal(false)
    reset()
  }

  const submitCreateNewBoard = (data) => {
    return createNewBoardAPI({
      ...data,
      theme: globalPersonaKey,
      ...(currentWorkspaceId ? { workspaceId: currentWorkspaceId } : {})
    }).then((createdBoard) => {
      handleCloseModal()
      if (createdBoard?._id) {
        navigate(`/boards/${createdBoard._id}`)
      } else {
        fetchBoardsAPI(location.search).then(updateStateData)
      }
    })
  }

  const handleToggleStarBoard = (board, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    playUiChime('sparkle')
    const nextStarred = !board.isStarred
    setBoards(prev => prev.map(item => (item._id === board._id ? { ...item, isStarred: nextStarred } : item)))
    updateBoardDetailsAPI(board._id, { isStarred: nextStarred }).catch(() => {
      setBoards(prev => prev.map(item => (item._id === board._id ? { ...item, isStarred: board.isStarred } : item)))
    })
  }

  const handleSaveBoardEdit = (boardId, patch) => {
    setSavingEdit(true)
    updateBoardDetailsAPI(boardId, patch)
      .then((updated) => {
        playUiChime('complete')
        toast.success('Đã cập nhật thông tin Bảng Sprint!')
        setBoards(prev => prev.map(item => (item._id === boardId ? { ...item, ...patch, ...(updated || {}) } : item)))
        if (activeBoardId === boardId) {
          setActiveBoardDetails(prev => (prev ? { ...prev, ...patch, ...(updated || {}) } : prev))
        }
        setEditingBoard(null)
      })
      .finally(() => {
        setSavingEdit(false)
      })
  }

  const handleConfirmDeleteBoard = (board) => {
    if (!board?._id || isDeleting) return
    setIsDeleting(true)
    deleteBoardDetailsAPI(board._id)
      .then(() => {
        playUiChime('complete')
        setDeletingBoard(null)
        fetchBoardsAPI(location.search).then(updateStateData)
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  const handleCloseCardMenu = () => {
    setMenuAnchor(null)
    setMenuBoard(null)
  }

  const handleDuplicateBoard = (board) => {
    handleCloseCardMenu()
    if (!board) return
    playUiChime('sparkle')
    const nextTitle = `${board.title} (Bản sao)`.slice(0, 50)
    createNewBoardAPI({
      title: nextTitle,
      description: board.description || DEFAULT_SPRINT_TEMPLATE.description,
      type: board.type || BOARD_TYPES.PUBLIC,
      theme: globalPersonaKey,
      useTemplate: true,
      ...(currentWorkspaceId ? { workspaceId: currentWorkspaceId } : {})
    }).then(() => {
      fetchBoardsAPI(location.search).then(updateStateData)
    })
  }

  const handleToggleBoardVisibility = (board) => {
    handleCloseCardMenu()
    if (!board) return
    const nextType = board.type === 'private' ? 'public' : 'private'
    updateBoardDetailsAPI(board._id, { type: nextType }).then(() => {
      setBoards(prev => prev.map(item => (item._id === board._id ? { ...item, type: nextType } : item)))
      toast.info(`Đã chuyển chế độ bảng sang ${nextType.toUpperCase()}`)
    })
  }

  const handleQuickExportBoard = (board, format = 'excel') => {
    handleCloseCardMenu()
    if (!board?._id) return
    fetchBoardDetailsDirectAPI(board._id).then((fullBoard) => {
      playUiChime('complete')
      if (format === 'csv') {
        exportSprintCrsToCsv(fullBoard)
        toast.success(`Đã xuất CSV cho "${board.title}"!`)
      } else {
        exportSprintCrsToExcel(fullBoard)
        toast.success(`Đã xuất Excel (.xls) cho "${board.title}"!`)
      }
    })
  }

  const handleCopyBoardLink = (board) => {
    handleCloseCardMenu()
    if (!board?._id) return
    const url = `${window.location.origin}/boards/${board._id}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
    }
    toast.success('Đã sao chép đường dẫn Bảng Sprint!')
  }

  const handleOpenBoardInView = (boardId, viewMode) => {
    handleCloseCardMenu()
    if (!boardId) return
    playUiChime('sparkle')
    persistBoardView(viewMode)
    navigate(`/boards/${boardId}`)
  }

  const handleOpenCardMenu = (e, board) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuAnchor(e.currentTarget)
    setMenuBoard(board)
  }

  const filteredBoards = useMemo(() => {
    if (!boards) return []
    const q = searchQuery.trim().toLowerCase()
    return boards.filter((b) => {
      if (currentWorkspaceId && b.workspaceId !== currentWorkspaceId) return false
      if (boardFilter === 'starred' && !b.isStarred) return false
      if (boardFilter === 'public' && b.type === 'private') return false
      if (boardFilter === 'private' && b.type !== 'private') return false
      if (!q) return true
      return (
        String(b.title || '').toLowerCase().includes(q) ||
        String(b.description || '').toLowerCase().includes(q) ||
        String(b?.sprintConfig?.sprintNumber || '').toLowerCase().includes(q)
      )
    })
  }, [boards, currentWorkspaceId, boardFilter, searchQuery])

  if (!boards) {
    return <PageLoadingSpinner caption={tPrimary('loadingWorkspace')} />
  }

  const starredBoards = boards.filter(b => b.isStarred && (!currentWorkspaceId || b.workspaceId === currentWorkspaceId))
  const currentSprintNum = extractSprintNumberOnly(
    activeBoardDetails?.sprintConfig?.sprintNumber || activeBoardDetails?.title
  )

  const renderCard = (b, idx, isHeroTile = false) => (
    <SprintBoardCard
      board={b}
      idx={idx}
      isHeroTile={isHeroTile}
      activeBoardId={activeBoardId}
      themeConfig={themeConfig}
      t={t}
      onToggleStar={handleToggleStarBoard}
      onEdit={(target) => setEditingBoard(target)}
      onDelete={(target) => setDeletingBoard(target)}
      onOpenCardMenu={handleOpenCardMenu}
      onOpenBoardInView={handleOpenBoardInView}
      onOpenWiki={(id) => navigate(`/boards/${id}/wiki`)}
    />
  )

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

      <AwwwardsWorkspaceHero
        themeConfig={themeConfig}
        totalBoards={totalBoards}
        starredCount={starredBoards.length}
        currentSprintLabel={currentSprintNum ? `SPRINT #${currentSprintNum}` : 'ACTIVE SPRINT'}
        onOpenCreateModal={() => handleOpenModalWithTemplate(true)}
        t={t}
      />

      <Box sx={{ paddingX: { xs: 2, md: 4 }, my: 3 }}>
        <SprintCommandDashboard
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectActiveBoardId={handleSelectActiveBoardId}
          activeBoardDetails={activeBoardDetails}
          loadingDetails={loadingDetails}
          themeConfig={themeConfig}
        />

        <Grid container spacing={3}>
          {/* Left 3 Cols: Workspace Tree, Sprint Board Filters & Unified Template */}
          <Grid xs={12} sm={3}>
            <WorkspaceSidebarSection />

            <Divider sx={{ my: 2 }} />

            <Typography variant='caption' sx={{ fontWeight: 800, color: 'text.secondary', px: 1, display: 'block', mb: 1 }}>
              ĐIỀU HƯỚNG & BỘ LỌC BẢNG SPRINT
            </Typography>
            <Stack direction='column' spacing={0.85}>
              <SidebarItem
                className={boardFilter === 'all' ? 'active' : ''}
                onClick={() => setBoardFilter('all')}
              >
                <SpaceDashboardIcon fontSize='small' />
                <Typography variant='body2' sx={{ fontWeight: 700, flex: 1 }} noWrap>
                  {t('allBoards')}
                </Typography>
                <Chip size='small' label={boards.length} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }} />
              </SidebarItem>

              <SidebarItem
                className={boardFilter === 'starred' ? 'active' : ''}
                onClick={() => setBoardFilter('starred')}
              >
                <StarRoundedIcon fontSize='small' sx={{ color: '#fbbf24' }} />
                <Typography variant='body2' sx={{ fontWeight: 700, flex: 1 }} noWrap>
                  Bảng đánh dấu sao (★)
                </Typography>
                <Chip size='small' label={starredBoards.length} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }} />
              </SidebarItem>

              <SidebarItem
                className={boardFilter === 'public' ? 'active' : ''}
                onClick={() => setBoardFilter('public')}
              >
                <PublicRoundedIcon fontSize='small' color='info' />
                <Typography variant='body2' sx={{ fontWeight: 700, flex: 1 }} noWrap>
                  Bảng Public
                </Typography>
              </SidebarItem>

              <SidebarItem
                className={boardFilter === 'private' ? 'active' : ''}
                onClick={() => setBoardFilter('private')}
              >
                <LockOutlinedIcon fontSize='small' color='warning' />
                <Typography variant='body2' sx={{ fontWeight: 700, flex: 1 }} noWrap>
                  Bảng Private
                </Typography>
              </SidebarItem>

              <SidebarItem onClick={handleOpenModal}>
                <LibraryAddIcon fontSize='small' color='primary' />
                <Typography variant='body2' sx={{ fontWeight: 700 }} noWrap>
                  {t('createNewSprintBoard')}
                </Typography>
              </SidebarItem>

              <SidebarItem
                onClick={() => navigate('/admin')}
                sx={{
                  borderColor: 'rgba(56, 189, 248, 0.45)',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(14, 165, 233, 0.12)' : 'rgba(14, 165, 233, 0.08)')
                }}
              >
                <AdminPanelSettingsOutlinedIcon fontSize='small' color='info' />
                <Typography variant='body2' sx={{ fontWeight: 800, flex: 1 }} noWrap>
                  Giám sát & Bảo mật (SOC)
                </Typography>
                <Chip size='small' color='info' label='v8' sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800 }} />
              </SidebarItem>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant='caption' sx={{ fontWeight: 800, color: 'text.secondary', px: 1, display: 'block', mb: 1 }}>
              MẪU SPRINT TIÊU CHUẨN (UNIFIED TEMPLATE)
            </Typography>
            <Card
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: `1px solid ${themeConfig.columnBorder}`,
                bgcolor: (theme) => (theme.palette.mode === 'dark'
                  ? 'var(--chella-raised-dark, #131c31)'
                  : 'var(--chella-raised-light, #ffffff)')
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <ViewKanbanRoundedIcon fontSize='small' sx={{ color: themeConfig.accentColor }} />
                <Typography variant='body2' sx={{ fontWeight: 800 }} noWrap>
                  {DEFAULT_SPRINT_TEMPLATE.title}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.25, lineHeight: 1.45 }}>
                Mọi Board & Sprint đều sử dụng chung 1 kiểu template chuẩn: Sprint Matrix, Kanban 3 cột chủ đề CR, đặc tả FRD A4 PDF & Obsidian Graph.
              </Typography>
              <Button
                variant='contained'
                size='small'
                fullWidth
                startIcon={<LibraryAddIcon fontSize='small' />}
                onClick={() => handleOpenModalWithTemplate(true)}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: '9px',
                  color: '#0f172a',
                  bgcolor: themeConfig.accentColor,
                  '&:hover': { bgcolor: themeConfig.accentColor, opacity: 0.92 }
                }}
              >
                {t('createNewSprintBoard')}
              </Button>
            </Card>
          </Grid>

          {/* Right 9 Cols: Starred Boards & All Sprint Boards */}
          <Grid xs={12} sm={9}>
            {starredBoards.length > 0 && boardFilter === 'all' && !searchQuery.trim() && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarRoundedIcon sx={{ color: '#fbbf24' }} />
                    <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                      {t('starredBoardsTitle')}
                    </Typography>
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{
                      fontFamily: '"JetBrains Mono", Consolas, monospace',
                      fontWeight: 800,
                      color: 'text.secondary',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    STARRED SPRINTS ({starredBoards.length})
                  </Typography>
                </Box>
                <Grid container spacing={2.5}>
                  {starredBoards.map((b, sIdx) => {
                    const isFeatured = sIdx === 0 && starredBoards.length > 1
                    return (
                      <Grid xs={12} sm={6} md={isFeatured ? 8 : 4} key={`starred-${b._id}`}>
                        {renderCard(b, sIdx, isFeatured)}
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SoraRibbonIcon />
                <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {currentWorkspace
                    ? formatMessage('wsBoardsInWorkspace', { name: currentWorkspace.name })
                    : t('allBoards')} ({filteredBoards.length})
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  size='small'
                  placeholder='Tìm kiếm tên bảng, số Sprint...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchRoundedIcon fontSize='small' />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '10px', fontSize: '0.84rem', minWidth: 230 }
                  }}
                />
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<LibraryAddIcon fontSize='small' />}
                  onClick={() => handleOpenModalWithTemplate(true)}
                  sx={{
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: '10px',
                    py: 0.85,
                    color: '#0f172a',
                    bgcolor: themeConfig.accentColor,
                    '&:hover': { bgcolor: themeConfig.accentColor, opacity: 0.92 }
                  }}
                >
                  {t('createNewSprintBoard')}
                </Button>
              </Box>
            </Box>

            {filteredBoards.length === 0 && (
              <Box sx={{
                p: 4,
                borderRadius: '16px',
                border: '1px dashed rgba(148, 163, 184, 0.4)',
                textAlign: 'center'
              }}>
                <SoraBunnyIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
                  {boards.length === 0 ? t('noBoardsCreatedTitle') : 'Không tìm thấy Bảng Sprint phù hợp'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  {boards.length === 0 ? t('noBoardsCreatedSub') : 'Hãy thử từ khóa khác hoặc xóa bộ lọc.'}
                </Typography>
                <Button variant='contained' startIcon={<LibraryAddIcon />} onClick={() => handleOpenModalWithTemplate(true)}>
                  {t('createNewSprintBoard')}
                </Button>
              </Box>
            )}

            {filteredBoards.length > 0 && (
              <Grid container spacing={2.5}>
                {filteredBoards.map((b, idx) => {
                  const isHeroTile = idx === 0 && filteredBoards.length >= 3
                  return (
                    <Grid xs={12} sm={6} md={isHeroTile ? 8 : 4} key={b._id}>
                      {renderCard(b, idx, isHeroTile)}
                    </Grid>
                  )
                })}
              </Grid>
            )}

            {(totalBoards > 0) && (
              <Box sx={{ my: 4, pr: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Pagination
                  size='large'
                  color='primary'
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

      <BoardCardContextMenu
        menuAnchor={menuAnchor}
        menuBoard={menuBoard}
        onClose={handleCloseCardMenu}
        onSelectActiveBoardId={handleSelectActiveBoardId}
        onEditBoard={(target) => setEditingBoard(target)}
        onOpenBoardInView={handleOpenBoardInView}
        onOpenWiki={(id) => navigate(`/boards/${id}/wiki`)}
        onQuickExportBoard={handleQuickExportBoard}
        onDuplicateBoard={handleDuplicateBoard}
        onToggleBoardVisibility={handleToggleBoardVisibility}
        onCopyBoardLink={handleCopyBoardLink}
        onDeleteBoard={(target) => setDeletingBoard(target)}
      />

      <CreateBoardModal
        isOpenModal={isOpenModal}
        onClose={handleCloseModal}
        themeConfig={themeConfig}
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

      <EditSprintBoardModal
        open={Boolean(editingBoard)}
        board={editingBoard}
        onClose={() => setEditingBoard(null)}
        onSave={handleSaveBoardEdit}
        saving={savingEdit}
      />

      <DeleteSprintBoardDialog
        open={Boolean(deletingBoard)}
        board={deletingBoard}
        onClose={() => setDeletingBoard(null)}
        onConfirm={handleConfirmDeleteBoard}
        deleting={isDeleting}
      />
    </Container>
  )
}

export default Boards
