import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import CloudSyncRoundedIcon from '@mui/icons-material/CloudSyncRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import MarkdownView from './MarkdownView'
import { formatDateTime } from '~/utils/i18nV5'

const AUTOSAVE_DELAY_MS = 1200
// Mirrors backend limits in chello-api wikiPageValidation (content ≤ 100k chars, ≤ 20 tags × 40 chars)
const WIKI_CONTENT_LIMIT = 100000
const TAG_MAX_LENGTH = 40
const TAG_MAX_COUNT = 20
const CONTENT_WARN_RATIO = 0.9
const DRAFT_BACKUP_PREFIX = 'chella_wiki_draft_'
const PAGE_ICONS = ['📄', '📐', '🗓️', '⚖️', '📚', '🔁', '🚀', '💡', '🧭', '🧪', '🔐', '💳', '📊', '🌿', '💧', '🌌', '🎐', '🐰']

const toDraft = (page) => ({
  title: page?.title || '',
  icon: page?.icon || '📄',
  content: page?.content || '',
  tagsText: (page?.tags || []).join(', ')
})

const draftToPatch = (draft) => ({
  title: draft.title.trim() || 'Untitled',
  icon: draft.icon,
  content: draft.content.slice(0, WIKI_CONTENT_LIMIT),
  tags: draft.tagsText.split(',').map(t => t.trim().slice(0, TAG_MAX_LENGTH)).filter(Boolean).slice(0, TAG_MAX_COUNT)
})

const isSameDraft = (a, b) => a.title === b.title && a.icon === b.icon && a.content === b.content && a.tagsText === b.tagsText

// Local safety net: a draft that failed to save is kept in localStorage until it is saved or discarded
const draftBackup = {
  read: (pageId) => {
    try {
      const raw = localStorage.getItem(`${DRAFT_BACKUP_PREFIX}${pageId}`)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      // Corrupted / unavailable storage — nothing to recover
      return null
    }
  },
  write: (pageId, draft) => {
    try {
      localStorage.setItem(`${DRAFT_BACKUP_PREFIX}${pageId}`, JSON.stringify(draft))
    } catch (e) {
      // Quota exceeded or storage disabled — the error toast already warned the user
    }
  },
  clear: (pageId) => {
    try {
      localStorage.removeItem(`${DRAFT_BACKUP_PREFIX}${pageId}`)
    } catch (e) {
      // Ignore: stale backups are harmless
    }
  }
}

function SaveStatus({ status, labels }) {
  const map = {
    saved: { Icon: CloudDoneRoundedIcon, text: labels.savedMsg, color: 'success.main' },
    saving: { Icon: CloudSyncRoundedIcon, text: labels.savingMsg, color: 'info.main' },
    dirty: { Icon: EditNoteRoundedIcon, text: labels.unsavedMsg, color: 'warning.main' }
  }
  const { Icon, text, color } = map[status] || map.saved
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color }}>
      <Icon sx={{ fontSize: 17 }} />
      <Typography variant="caption" sx={{ fontWeight: 700 }}>{text}</Typography>
    </Box>
  )
}

function WikiEditor({ page, cards, lang, labels, onSave, onDelete, resolveTarget, onWikiLinkClick }) {
  const [draft, setDraft] = useState(() => toDraft(page))
  const [savedDraft, setSavedDraft] = useState(() => toDraft(page))
  const [mode, setMode] = useState(page?.content ? 'preview' : 'edit')
  const [status, setStatus] = useState('saved')
  const [iconAnchor, setIconAnchor] = useState(null)
  const [recoveredDraft, setRecoveredDraft] = useState(null)
  const textareaRef = useRef(null)
  const currentPageIdRef = useRef(page?._id)
  const latestRef = useRef({ draft, savedDraft, onSave })
  latestRef.current = { draft, savedDraft, onSave }

  // Reset local draft only when switching to a different page; flush unsaved edits of the previous page
  useEffect(() => {
    const pageId = page?._id
    currentPageIdRef.current = pageId
    const fresh = toDraft(page)
    const backup = pageId ? draftBackup.read(pageId) : null
    setDraft(fresh)
    setSavedDraft(fresh)
    setStatus('saved')
    setMode(page?.content ? 'preview' : 'edit')
    setRecoveredDraft(backup && !isSameDraft(backup, fresh) ? backup : null)
    return () => {
      const { draft: lastDraft, savedDraft: lastSaved, onSave: save } = latestRef.current
      if (pageId && !isSameDraft(lastDraft, lastSaved)) {
        // Fire-and-forget save; if it fails the draft is kept locally and offered back next time
        save(pageId, draftToPatch(lastDraft)).catch(() => draftBackup.write(pageId, lastDraft))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?._id])

  const persist = async (nextDraft) => {
    const pageId = page._id
    setStatus('saving')
    try {
      await onSave(pageId, draftToPatch(nextDraft))
      draftBackup.clear(pageId)
      // The user may have switched pages while the request was in flight
      if (currentPageIdRef.current !== pageId) return
      setSavedDraft(nextDraft)
      setStatus('saved')
    } catch (error) {
      // Error toast comes from the axios interceptor; keep the draft locally so nothing is lost
      draftBackup.write(pageId, nextDraft)
      if (currentPageIdRef.current === pageId) setStatus('dirty')
    }
  }

  const restoreRecovered = () => {
    setDraft(recoveredDraft)
    setMode('split')
    setRecoveredDraft(null)
  }

  const discardRecovered = () => {
    draftBackup.clear(page._id)
    setRecoveredDraft(null)
  }

  useEffect(() => {
    if (isSameDraft(draft, savedDraft)) return undefined
    setStatus('dirty')
    const timer = setTimeout(() => persist(draft), AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, savedDraft])

  const update = (field) => (value) => setDraft(prev => ({ ...prev, [field]: value }))

  const insertAtCursor = (snippet) => {
    const el = textareaRef.current
    const content = draft.content
    const start = el?.selectionStart ?? content.length
    const end = el?.selectionEnd ?? content.length
    const next = `${content.slice(0, start)}${snippet}${content.slice(end)}`
    update('content')(next)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(start + snippet.length, start + snippet.length)
    })
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      if (!isSameDraft(draft, savedDraft)) persist(draft)
    }
  }

  const editor = (
    <TextField
      inputRef={textareaRef}
      fullWidth
      multiline
      minRows={18}
      value={draft.content}
      onChange={(e) => update('content')(e.target.value.slice(0, WIKI_CONTENT_LIMIT))}
      onKeyDown={handleKeyDown}
      placeholder={labels.wikiHint}
      helperText={draft.content.length > WIKI_CONTENT_LIMIT * CONTENT_WARN_RATIO
        ? `${labels.contentLimitMsg} (${draft.content.length.toLocaleString()}/${WIKI_CONTENT_LIMIT.toLocaleString()})`
        : ' '}
      FormHelperTextProps={{ sx: { color: 'warning.main', fontWeight: 700 } }}
      InputProps={{ sx: { fontFamily: '"JetBrains Mono", Consolas, monospace', fontSize: '0.84rem', lineHeight: 1.65, alignItems: 'flex-start' } }}
    />
  )
  const preview = (
    <MarkdownView content={draft.content} resolveTarget={resolveTarget} onWikiLinkClick={onWikiLinkClick} missingLabel={labels.missingLink} />
  )

  return (
    <Box onKeyDown={handleKeyDown} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, animation: 'chelloFadeSlideUp 0.3s ease' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Icon">
          <IconButton onClick={(e) => setIconAnchor(e.currentTarget)} sx={{ fontSize: 30, width: 52, height: 52, transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.1) rotate(-6deg)' } }}>
            {draft.icon}
          </IconButton>
        </Tooltip>
        <InputBase
          fullWidth
          value={draft.title}
          onChange={(e) => update('title')(e.target.value.slice(0, 150))}
          placeholder={labels.pageTitlePlaceholder}
          sx={{ fontSize: '1.7rem', fontWeight: 800 }}
        />
        <SaveStatus status={status} labels={labels} />
        <Tooltip title={labels.deleteBtn}>
          <IconButton color="error" onClick={onDelete}><DeleteOutlineRoundedIcon /></IconButton>
        </Tooltip>
      </Box>

      {recoveredDraft && (
        <Alert
          severity="warning"
          action={
            <>
              <Button color="inherit" size="small" onClick={restoreRecovered} sx={{ fontWeight: 800 }}>{labels.restoreBtn}</Button>
              <Button color="inherit" size="small" onClick={discardRecovered}>{labels.discardBtn}</Button>
            </>
          }
        >
          {labels.draftRecoveredMsg}
        </Alert>
      )}

      <Menu anchorEl={iconAnchor} open={Boolean(iconAnchor)} onClose={() => setIconAnchor(null)}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 40px)', gap: 0.5, px: 1 }}>
          {PAGE_ICONS.map(icon => (
            <IconButton key={icon} onClick={() => { update('icon')(icon); setIconAnchor(null) }} sx={{ fontSize: 20 }}>{icon}</IconButton>
          ))}
        </Box>
      </Menu>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label={labels.tagsLabel}
          value={draft.tagsText}
          onChange={(e) => update('tagsText')(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
        />
        <Autocomplete
          size="small"
          options={cards.filter(c => c.crCode)}
          getOptionLabel={(c) => `${c.crCode} • ${c.title}`}
          onChange={(e, card) => {
            if (!card) return
            if (mode === 'preview') setMode('split')
            insertAtCursor(`[[${card.crCode}]]`)
          }}
          value={null}
          blurOnSelect
          sx={{ width: 280 }}
          renderInput={(params) => <TextField {...params} label={labels.insertCrLink} />}
        />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={mode}
          onChange={(e, next) => next && setMode(next)}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, px: 1.5 } }}
        >
          <ToggleButton value="edit">{labels.editBtn}</ToggleButton>
          <ToggleButton value="split">Split</ToggleButton>
          <ToggleButton value="preview">{labels.previewBtn}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Typography variant="caption" color="text.secondary">
        {labels.lastEdited}: {formatDateTime(page?.updatedAt || page?.createdAt, lang)}
        {page?.updatedBy?.displayName || page?.createdBy?.displayName ? ` • ${page?.updatedBy?.displayName || page?.createdBy?.displayName}` : ''}
      </Typography>

      {mode === 'edit' && editor}
      {mode === 'preview' && (
        <Box onDoubleClick={() => setMode('split')} sx={{ minHeight: 320 }}>
          {draft.content ? preview : <Typography color="text.secondary">{labels.wikiHint}</Typography>}
        </Box>
      )}
      {mode === 'split' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          {editor}
          <Box sx={{ p: 2, borderRadius: '12px', border: (theme) => `1px solid ${theme.palette.divider}`, overflowY: 'auto', maxHeight: '70vh' }}>{preview}</Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="small" variant="outlined" disabled={status !== 'dirty'} onClick={() => persist(draft)}>{labels.saveBtn} (Ctrl+S)</Button>
      </Box>
    </Box>
  )
}

export default WikiEditor
