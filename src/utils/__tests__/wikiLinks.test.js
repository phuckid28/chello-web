import { describe, it, expect } from 'vitest'
import {
  computeBacklinks,
  createWikiResolver,
  decodeWikiHref,
  extractWikiLinks,
  transformWikiLinksToMarkdown
} from '~/utils/wikiLinks'

describe('extractWikiLinks', () => {
  it('returns unique targets and strips aliases', () => {
    const md = 'See [[BNPL-945]] and [[BNPL-945|limit]] plus [[Glossary]]'
    expect(extractWikiLinks(md)).toEqual(['BNPL-945', 'Glossary'])
  })

  it('ignores links inside fenced code blocks', () => {
    const md = 'Real [[A]]\n```\n[[B]]\n```\nAfter [[C]]'
    expect(extractWikiLinks(md)).toEqual(['A', 'C'])
  })

  it('handles empty input', () => {
    expect(extractWikiLinks(undefined)).toEqual([])
  })
})

describe('transformWikiLinksToMarkdown', () => {
  it('converts wiki links into hash links with encoded targets', () => {
    expect(transformWikiLinksToMarkdown('[[Sprint 34 Retro|Retro]]'))
      .toBe('[Retro](#wiki/Sprint%2034%20Retro)')
  })

  it('round-trips through decodeWikiHref', () => {
    const md = transformWikiLinksToMarkdown('[[Quy tắc hạn mức]]')
    const href = md.match(/\((.+)\)/)[1]
    expect(decodeWikiHref(href)).toBe('Quy tắc hạn mức')
  })

  it('returns null for non-wiki or malformed hrefs', () => {
    expect(decodeWikiHref('https://example.com')).toBeNull()
    expect(decodeWikiHref('#wiki/%E0%A4%A')).toBeNull()
  })

  it('encodes parentheses so unbalanced targets keep a valid markdown link', () => {
    const md = transformWikiLinksToMarkdown('[[Spec (v2]]')
    expect(md).toBe('[Spec (v2](#wiki/Spec%20%28v2)')
    expect(decodeWikiHref('#wiki/Spec%20%28v2')).toBe('Spec (v2')
  })
})

describe('createWikiResolver', () => {
  const resolve = createWikiResolver({
    cards: [{ _id: 'c1', crCode: 'BNPL-945' }],
    pages: [{ _id: 'p1', title: 'Glossary' }]
  })

  it('resolves Ticket IDs and page titles case-insensitively', () => {
    expect(resolve('bnpl-945').type).toBe('card')
    expect(resolve('GLOSSARY').page._id).toBe('p1')
  })

  it('reports missing targets', () => {
    expect(resolve('Unknown')).toEqual({ type: 'missing', target: 'Unknown' })
  })
})

describe('computeBacklinks', () => {
  it('finds pages and cards referencing any key, excluding the current page', () => {
    const pages = [
      { _id: 'p1', title: 'Glossary', content: 'links [[BNPL-945]]' },
      { _id: 'p2', title: 'Other', content: 'nothing' },
      { _id: 'p3', title: 'Self', content: '[[Self]]' }
    ]
    const cards = [{ _id: 'c2', description: 'depends on [[glossary]]' }]
    const result = computeBacklinks({ keys: ['Glossary', 'Self'], pages, cards, excludePageId: 'p3' })
    expect(result.pages.map(p => p._id)).toEqual([])
    expect(result.cards.map(c => c._id)).toEqual(['c2'])

    const byTicket = computeBacklinks({ keys: ['BNPL-945'], pages, cards })
    expect(byTicket.pages.map(p => p._id)).toEqual(['p1'])
  })
})
