import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Paper from '@mui/material/Paper'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import { Link as RouterLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { searchUsersAPI } from '~/apis'
import {
  extractMentions,
  getMentionQuery,
  insertMention,
  tokenizeMentions
} from '~/utils/mentions'
import UserHoverCard from '~/components/User/UserHoverCard'
import { useTranslation } from '~/customHooks/useTranslation'
import soraAvatar from '~/assets/sora.jpg'

function CardActivitySection({ cardComments = [], onAddCardComment }) {
  const currentUser = useSelector(selectCurrentUser)
  const board = useSelector(selectCurrentActiveBoard)
  const { t, tPrimary } = useTranslation()
  const [draft, setDraft] = useState('')
  const [caret, setCaret] = useState(0)
  const [suggestions, setSuggestions] = useState([])
  const inputRef = useRef(null)

  const mentionState = getMentionQuery(draft, caret)
  const hasMentionState = Boolean(mentionState)
  const mentionQuery = mentionState?.query || ''

  useEffect(() => {
    if (!hasMentionState) {
      setSuggestions([])
      return undefined
    }
    const q = mentionQuery
    const boardUsers = board?.FE_allUsers || []
    if (!q) {
      setSuggestions(boardUsers.filter(u => u?.username).slice(0, 6))
      return undefined
    }
    let active = true
    searchUsersAPI({ q, boardId: board?._id })
      .then((res) => {
        if (!active) return
        const list = Array.isArray(res) ? res : (res?.users || [])
        setSuggestions(list.slice(0, 6))
      })
      .catch(() => {
        if (!active) return
        const fallback = boardUsers.filter(u =>
          String(u?.username || '').toLowerCase().includes(q.toLowerCase()) ||
          String(u?.displayName || '').toLowerCase().includes(q.toLowerCase())
        )
        setSuggestions(fallback.slice(0, 6))
      })
    return () => {
      active = false
    }
  }, [hasMentionState, mentionQuery, board?._id, board?.FE_allUsers])

  const handleSelectMention = (username) => {
    if (!mentionState || !username) return
    const result = insertMention(draft, mentionState.start, caret, username)
    setDraft(result.text)
    setCaret(result.caret)
    setSuggestions([])
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleAddCardComment = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const trimmed = draft.trim()
      if (!trimmed) return

      const commentToAdd = {
        userAvatar: currentUser?.avatar || '',
        userDisplayName: currentUser?.displayName || currentUser?.username || 'User',
        userUsername: currentUser?.username || '',
        content: trimmed,
        mentionedUsernames: extractMentions(trimmed)
      }
      onAddCardComment(commentToAdd).then(() => {
        setDraft('')
        setCaret(0)
        setSuggestions([])
      })
    }
  }

  const renderCommentTokens = (text) => {
    const tokens = tokenizeMentions(text)
    if (tokens.length === 0) return text
    return tokens.map((token, i) =>
      token.type === 'mention' ? (
        <Chip
          key={i}
          component={RouterLink}
          to={`/u/${token.value}`}
          label={`@${token.value}`}
          size="small"
          color="primary"
          variant="outlined"
          clickable
          sx={{ height: 20, fontSize: '0.75rem', mx: 0.25 }}
        />
      ) : (
        <span key={i}>{token.value}</span>
      )
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{ width: 36, height: 36, cursor: 'pointer' }}
            alt={currentUser?.displayName}
            src={currentUser?.avatar || soraAvatar}
          />
          <TextField
            inputRef={inputRef}
            fullWidth
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setCaret(e.target.selectionStart || e.target.value.length)
            }}
            onClick={(e) => setCaret(e.target.selectionStart || 0)}
            onKeyUp={(e) => setCaret(e.target.selectionStart || 0)}
            placeholder={`${tPrimary('writeCommentPlaceholder')} (${t('collabMentionHint')})`}
            type="text"
            variant="outlined"
            multiline
            onKeyDown={handleAddCardComment}
          />
        </Box>

        {mentionState && suggestions.length > 0 && (
          <Paper
            elevation={6}
            sx={{
              position: 'absolute',
              left: 44,
              right: 0,
              zIndex: 20,
              mt: 0.5,
              maxHeight: 220,
              overflowY: 'auto'
            }}
          >
            {suggestions.map((u) => (
              <MenuItem
                key={u._id || u.username}
                onClick={() => handleSelectMention(u.username)}
                sx={{ gap: 1 }}
              >
                <Avatar src={u.avatar || soraAvatar} sx={{ width: 24, height: 24 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {u.displayName || u.username}
                </Typography>
                {u.username && (
                  <Typography variant="caption" color="text.secondary">
                    @{u.username}
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Paper>
        )}
      </Box>

      {cardComments.length === 0 && (
        <Typography sx={{ pl: '45px', fontSize: '14px', fontWeight: '500', color: '#b1b1b1' }}>
          {tPrimary('noActivityFound')}
        </Typography>
      )}
      {cardComments.map((comment, index) => (
        <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1.5 }} key={comment.commentedAt || index}>
          <UserHoverCard
            user={{
              displayName: comment.userDisplayName,
              username: comment.userUsername,
              avatar: comment.userAvatar
            }}
          >
            <Tooltip title={comment.userDisplayName}>
              <Avatar
                sx={{ width: 36, height: 36, cursor: 'pointer' }}
                alt={comment.userDisplayName}
                src={comment.userAvatar || soraAvatar}
              />
            </Tooltip>
          </UserHoverCard>
          <Box sx={{ width: 'inherit' }}>
            <Typography variant="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              {comment.userDisplayName}
            </Typography>

            <Typography variant="span" sx={{ fontSize: '12px' }}>
              {comment.commentedAt ? new Date(comment.commentedAt).toLocaleString() : ''}
            </Typography>

            <Box sx={{
              display: 'block',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : 'white',
              p: '8px 12px',
              mt: '4px',
              border: '0.5px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              wordBreak: 'break-word',
              boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)'
            }}>
              {renderCommentTokens(comment.content)}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default CardActivitySection
