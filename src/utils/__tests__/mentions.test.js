import { describe, it, expect } from 'vitest'
import {
  extractMentions,
  getMentionQuery,
  insertMention,
  tokenizeMentions
} from '~/utils/mentions'

describe('extractMentions', () => {
  it('returns unique usernames in order of appearance', () => {
    expect(extractMentions('hi @alice and @bob.k, ping @alice again')).toEqual(['alice', 'bob.k'])
  })

  it('ignores e-mail addresses', () => {
    expect(extractMentions('mail a@b.com or john@example.org, then @carol')).toEqual(['carol'])
  })

  it('ignores mentions inside inline code and fenced code blocks', () => {
    const text = 'see `@dave` and\n```\n@erin\n```\nbut @frank'
    expect(extractMentions(text)).toEqual(['frank'])
  })

  it('enforces the 3–30 character username rule', () => {
    const tooLong = `@${'a'.repeat(31)}`
    expect(extractMentions(`@ab ${tooLong} @abc`)).toEqual(['abc'])
  })

  it('drops trailing sentence punctuation', () => {
    expect(extractMentions('thanks @grace.')).toEqual(['grace'])
  })

  it('handles empty / non-string input', () => {
    expect(extractMentions('')).toEqual([])
    expect(extractMentions(null)).toEqual([])
  })
})

describe('getMentionQuery', () => {
  it('returns the active query and the index of @', () => {
    const text = 'hello @ali'
    expect(getMentionQuery(text, text.length)).toEqual({ query: 'ali', start: 6 })
  })

  it('returns an empty query right after typing @', () => {
    expect(getMentionQuery('@', 1)).toEqual({ query: '', start: 0 })
  })

  it('returns null when the caret is not in a mention', () => {
    expect(getMentionQuery('hello @ali bob', 14)).toBeNull()
    expect(getMentionQuery('mail a@b', 8)).toBeNull()
    expect(getMentionQuery('plain text', 5)).toBeNull()
  })

  it('returns null inside an open code span', () => {
    expect(getMentionQuery('`code @ali', 10)).toBeNull()
  })

  it('uses the caret position, not the end of the text', () => {
    const text = 'hey @jo there'
    expect(getMentionQuery(text, 7)).toEqual({ query: 'jo', start: 4 })
  })
})

describe('insertMention', () => {
  it('replaces the query with @username and a trailing space', () => {
    expect(insertMention('hi @al', 3, 6, 'alice')).toEqual({ text: 'hi @alice ', caret: 10 })
  })

  it('keeps the text after the caret without doubling spaces', () => {
    expect(insertMention('hi @al there', 3, 6, 'alice')).toEqual({ text: 'hi @alice there', caret: 10 })
  })
})

describe('tokenizeMentions', () => {
  it('splits text into text and mention tokens', () => {
    expect(tokenizeMentions('hi @alice, ok')).toEqual([
      { type: 'text', value: 'hi ' },
      { type: 'mention', value: 'alice' },
      { type: 'text', value: ', ok' }
    ])
  })

  it('keeps e-mails and code as plain text', () => {
    expect(tokenizeMentions('a@b.com `@x1y`')).toEqual([{ type: 'text', value: 'a@b.com `@x1y`' }])
  })

  it('returns an empty array for empty input', () => {
    expect(tokenizeMentions('')).toEqual([])
  })
})
