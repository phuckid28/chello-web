import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useConfirm } from 'material-ui-confirm'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AppBar from '~/components/AppBar/AppBar'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import PageTree from './PageTree'
import WikiEditor from './WikiEditor'
import LinksPanel from './LinksPanel'
import { WIKI_TEMPLATE_KEYS, getWikiTemplate, renderWikiTemplate } from './wikiTemplates'
import { extractOutline } from './wikiOutline'
import { createWikiPageAPI, deleteWikiPageAPI, fetchWikiPagesAPI, updateWikiPageAPI } from '~/apis'
import { fetchBoardDetailsAPI, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { showModalActiveCard, updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'
import { usePersonaTheme } from '~/customHooks/usePersonaTheme'
import { useTranslation } from '~/customHooks/useTranslation'
import { computeBacklinks, createWikiResolver, extractWikiLinks } from '~/utils/wikiLinks'
import { collectBoardCardsWithColumn, formatDateVN } from '~/utils/excelExporter'
import { formatMessage } from '~/utils/i18nV5'
import { playUiChime } from '~/utils/soundEffects'
import { setBoardThemeOverride } from '~/fx/fxThemeStore'

const LABEL_KEYS = [
  'newPage', 'newSubPage', 'searchPages', 'pageTitlePlaceholder', 'editBtn', 'previewBtn', 'saveBtn', 'deleteBtn',
  'savingMsg', 'savedMsg', 'unsavedMsg', 'backlinks', 'outgoingLinks', 'noBacklinks', 'noOutgoingLinks', 'missingLink',
  'wikiHint', 'tagsLabel', 'lastEdited', 'pageOutline', 'insertCrLink',
  'draftRecoveredMsg', 'restoreBtn', 'discardBtn', 'contentLimitMsg'
]

const glassSx = {
  borderRadius: '18px',
  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)'),
  backdropFilter: 'blur(18px) saturate(160%)',
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)'
}

function TemplatePicker({ onPick, tPrimary }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 1.5 }}>
      {WIKI_TEMPLATE_KEYS.map((key, idx) => {
        const tpl = getWikiTemplate(key)
        return (
          <Box
            key={key}
            onClick={() => onPick(key)}
            sx={{
              p: 2,
              borderRadius: '14px',
              cursor: 'pointer',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              animation: `chelloFadeSlideUp 0.35s ease ${idx * 0.05}s both`,
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 24px rgba(0,0,0,0.15)' }
            }}
          >
            <Typography sx={{ fontSize: 28 }}>{tpl.icon}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.5 }}>{tPrimary(tpl.titleKey)}</Typography>
          </Box>
        )
      })}
    </Box>
  )
}

function KnowledgeHub() {
  const { boardId, pageId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const board = useSelector(selectCurrentActiveBoard)
  const { themeConfig } = usePersonaTheme(board?.theme)
  const { tPrimary, lang } = useTranslation()

  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const deletedIdsRef = useRef(new Set())

  const labels = useMemo(() => Object.fromEntries(LABEL_KEYS.map(k => [k, tPrimary(k)])), [tPrimary])
  const boardMatches = board?._id === boardId
  const cards = useMemo(
    () => (boardMatches ? collectBoardCardsWithColumn(board).map(r => r.card) : []),
    [board, boardMatches]
  )

  const loadPages = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const list = await fetchWikiPagesAPI(boardId)
      setPages(Array.isArray(list) ? list : [])
    } catch (error) {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    setBoardThemeOverride(board?.theme || null)
    return () => setBoardThemeOverride(null)
  }, [board?.theme])

  useEffect(() => {
    if (!boardMatches) dispatch(fetchBoardDetailsAPI(boardId))
    loadPages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])

  const selectedPage = pages.find(p => p._id === pageId) || null
  const goToPage = (id) => navigate(id ? `/boards/${boardId}/wiki/${id}` : `/boards/${boardId}/wiki`)

  const createPage = async ({ title, parentId = null, templateKey = 'blank' }) => {
    const firstCr = cards.find(c => c.crCode)?.crCode || 'CR-1'
    const tpl = getWikiTemplate(templateKey)
    try {
      const created = await createWikiPageAPI({
        boardId,
        parentId,
        title: String(title || tPrimary(tpl.titleKey)).slice(0, 150),
        icon: tpl.icon,
        content: renderWikiTemplate(templateKey, {
          lang,
          sprint: board?.sprintConfig?.name || 'Sprint',
          crCode: firstCr,
          date: formatDateVN(new Date())
        })
      })
      setPages(prev => [...prev, created])
      playUiChime('sparkle')
      goToPage(created._id)
    } catch (error) {
      // The axios interceptor already shows the API error toast
    }
  }

  const savePage = async (id, patch) => {
    if (deletedIdsRef.current.has(id)) return
    const updated = await updateWikiPageAPI(id, patch)
    setPages(prev => prev.map(p => (p._id === id ? { ...p, ...updated } : p)))
  }

  const deletePage = async () => {
    if (!selectedPage) return
    try {
      await confirm({
        title: tPrimary('deletePageTitle'),
        description: formatMessage(tPrimary('deletePageConfirm'), { title: selectedPage.title }),
        confirmationText: tPrimary('deleteBtn'),
        cancellationText: tPrimary('cancelBtn')
      })
    } catch (cancelled) {
      // User dismissed the confirmation dialog
      return
    }
    deletedIdsRef.current.add(selectedPage._id)
    try {
      await deleteWikiPageAPI(selectedPage._id)
    } catch (error) {
      // Deletion failed (toast shown by interceptor) — allow saving this page again
      deletedIdsRef.current.delete(selectedPage._id)
      return
    }
    goToPage(null)
    loadPages()
  }

  const resolveTarget = useMemo(() => createWikiResolver({ cards, pages }), [cards, pages])

  const openCard = (card) => {
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  const handleWikiTarget = (resolved) => {
    if (resolved.type === 'card') return openCard(resolved.card)
    if (resolved.type === 'page') return goToPage(resolved.page._id)
    return createPage({ title: resolved.target, parentId: selectedPage?._id || null })
  }

  const outgoing = useMemo(
    () => (selectedPage ? extractWikiLinks(selectedPage.content).map(resolveTarget) : []),
    [selectedPage, resolveTarget]
  )
  const backlinks = useMemo(
    () => (selectedPage
      ? computeBacklinks({ keys: [selectedPage.title], pages, cards, excludePageId: selectedPage._id })
      : { pages: [], cards: [] }),
    [selectedPage, pages, cards]
  )
  const outline = useMemo(() => extractOutline(selectedPage?.content), [selectedPage?.content])

  const renderMain = () => {
    if (loading) {
      return <Box>{[60, 90, 75, 85].map((w, i) => <Skeleton key={i} height={34} width={`${w}%`} />)}</Box>
    }
    if (loadError) {
      return <Alert severity="error" action={<Button onClick={loadPages}>Retry</Button>}>{tPrimary('loadFailed')}</Alert>
    }
    if (pageId && !selectedPage) {
      return <Alert severity="warning">{tPrimary('pageNotFound')}</Alert>
    }
    if (!selectedPage) {
      return (
        <Box sx={{ animation: 'chelloFadeSlideUp 0.35s ease' }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{pages.length ? '📚' : '🌱'} {tPrimary('emptyHubTitle')}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>{tPrimary('emptyHubSub')}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0.4, color: 'text.secondary', display: 'block', mb: 1 }}>
            {tPrimary('templatesLabel').toUpperCase()}
          </Typography>
          <TemplatePicker tPrimary={tPrimary} onPick={(templateKey) => createPage({ templateKey })} />
          <Alert severity="info" sx={{ mt: 3 }}>{tPrimary('wikiHint')}</Alert>
        </Box>
      )
    }
    return (
      <WikiEditor
        page={selectedPage}
        cards={cards}
        lang={lang}
        labels={labels}
        onSave={savePage}
        onDelete={deletePage}
        resolveTarget={resolveTarget}
        onWikiLinkClick={handleWikiTarget}
      />
    )
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ActiveCard />
      <AppBar boardTheme={board?.theme} />
      <Box sx={{
        flex: 1,
        p: { xs: 1.5, md: 2.5 },
        backgroundImage: (theme) => `${theme.palette.mode === 'dark' ? themeConfig.boardOverlayDark : themeConfig.boardOverlayLight}, url(${themeConfig.heroImage})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate(`/boards/${boardId}`)}
            sx={{ color: 'white', bgcolor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', fontWeight: 700, '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.65)' } }}
          >
            {tPrimary('backToBoard')}
          </Button>
          <Box sx={{ color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.45)', minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }} noWrap>
              📚 {tPrimary('knowledgeHubBtn')} • {board?.title || ''}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92 }}>{tPrimary('knowledgeHubSub')}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '260px 1fr', xl: '270px 1fr 300px' }, alignItems: 'start' }}>
          <Box sx={{ ...glassSx, p: 1.5, position: { md: 'sticky' }, top: 16, height: { md: 'calc(100vh - 170px)' } }}>
            <PageTree pages={pages} selectedId={pageId} onSelect={goToPage} onCreate={(parentId) => createPage({ parentId })} labels={labels} />
          </Box>
          <Box sx={{ ...glassSx, p: { xs: 2, md: 3 }, minWidth: 0, minHeight: 'calc(100vh - 170px)' }}>
            {renderMain()}
          </Box>
          {selectedPage && (
            <Box sx={{ ...glassSx, p: 2, display: { xs: 'none', xl: 'block' }, position: 'sticky', top: 16, maxHeight: 'calc(100vh - 170px)', overflowY: 'auto' }}>
              <LinksPanel
                outline={outline}
                outgoing={outgoing}
                backlinks={backlinks}
                onOpenTarget={handleWikiTarget}
                onOpenPage={goToPage}
                onOpenCard={openCard}
                labels={labels}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  )
}

export default KnowledgeHub
