// @mention helpers shared by the comment composer and renderers (contract v7 §4).
// Server regex: @([a-z0-9._-]{3,30}). The client additionally ignores e-mail addresses,
// code spans and trailing sentence punctuation so highlighting matches user intent.

const USERNAME_CHARS = 'a-z0-9._-'
const MIN_LENGTH = 3
const MAX_LENGTH = 30

// `@` must not be glued to a word (e-mails) and the run must not continue past 30 chars
const MENTION_PATTERN = `(?<![A-Za-z0-9._@-])@([${USERNAME_CHARS}]{${MIN_LENGTH},${MAX_LENGTH}})(?![A-Za-z0-9_-])`
const QUERY_RE = new RegExp(`(?<![A-Za-z0-9._@-])@([${USERNAME_CHARS}]{0,${MAX_LENGTH}})$`)
const FENCED_CODE_RE = /```[\s\S]*?(?:```|$)/g
const INLINE_CODE_RE = /`[^`\n]*`/g
const TRAILING_PUNCTUATION_RE = /\.+$/

const blank = (match) => ' '.repeat(match.length)

// Replaces code spans with spaces so indices stay aligned with the original text
const maskCode = (text) => text.replace(FENCED_CODE_RE, blank).replace(INLINE_CODE_RE, blank)

// Returns [{ username, index, length }] for every valid mention in the text
const findMentions = (text) => {
  if (typeof text !== 'string' || !text) return []
  const masked = maskCode(text)
  const regex = new RegExp(MENTION_PATTERN, 'g')
  return [...masked.matchAll(regex)]
    .map((match) => {
      const username = match[1].replace(TRAILING_PUNCTUATION_RE, '')
      return { username, index: match.index, length: username.length + 1 }
    })
    .filter((mention) => mention.username.length >= MIN_LENGTH)
}

/** Unique usernames mentioned in `text`, in order of first appearance. */
export const extractMentions = (text) => [...new Set(findMentions(text).map((m) => m.username))]

/** Active `@query` right before the caret → `{ query, start }` (start = index of `@`), or null. */
export const getMentionQuery = (text, caretIndex) => {
  if (typeof text !== 'string') return null
  const caret = Math.max(0, Math.min(Number(caretIndex) || 0, text.length))
  const before = text.slice(0, caret)
  const backticks = (before.match(/`/g) || []).length
  if (backticks % 2 === 1) return null
  const match = before.match(QUERY_RE)
  if (!match) return null
  return { query: match[1], start: match.index }
}

/** Replaces the text between `start` (the `@`) and the caret with `@username `. */
export const insertMention = (text, start, caretIndex, username) => {
  const source = String(text || '')
  const head = source.slice(0, start)
  const tail = source.slice(caretIndex).replace(/^ /, '')
  const inserted = `@${username} `
  return { text: `${head}${inserted}${tail}`, caret: head.length + inserted.length }
}

/** Splits text into `{ type: 'text' | 'mention', value }` tokens for rendering. */
export const tokenizeMentions = (text) => {
  if (typeof text !== 'string' || !text) return []
  const tokens = []
  let cursor = 0
  findMentions(text).forEach(({ username, index, length }) => {
    if (index > cursor) tokens.push({ type: 'text', value: text.slice(cursor, index) })
    tokens.push({ type: 'mention', value: username })
    cursor = index + length
  })
  if (cursor < text.length) tokens.push({ type: 'text', value: text.slice(cursor) })
  return tokens
}
