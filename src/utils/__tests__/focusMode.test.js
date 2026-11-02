import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getFocusActive,
  isFocusActive,
  resetFocusStore,
  setFocusFromUser,
  subscribeFocus
} from '../focusMode'

const NOW = 1_800_000_000_000

afterEach(() => {
  resetFocusStore()
  vi.useRealTimers()
})

describe('isFocusActive', () => {
  it('is true for focus mode without expiry', () => {
    expect(isFocusActive({ status: { mode: 'focus' } }, NOW)).toBe(true)
    expect(isFocusActive({ status: { mode: 'focus', until: null } }, NOW)).toBe(true)
  })

  it('respects the until timestamp', () => {
    expect(isFocusActive({ status: { mode: 'focus', until: NOW + 1000 } }, NOW)).toBe(true)
    expect(isFocusActive({ status: { mode: 'focus', until: NOW - 1 } }, NOW)).toBe(false)
  })

  it('is false for other modes or missing users', () => {
    expect(isFocusActive({ status: { mode: 'meeting' } }, NOW)).toBe(false)
    expect(isFocusActive(null, NOW)).toBe(false)
    expect(isFocusActive({}, NOW)).toBe(false)
  })
})

describe('focus store', () => {
  it('notifies subscribers only when the focus state changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeFocus(listener)
    setFocusFromUser({ status: { mode: 'focus' } })
    setFocusFromUser({ status: { mode: 'focus', emoji: '🎧' } })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(getFocusActive()).toBe(true)
    setFocusFromUser({ status: { mode: 'available' } })
    expect(listener).toHaveBeenCalledTimes(2)
    expect(getFocusActive()).toBe(false)
    unsubscribe()
    setFocusFromUser({ status: { mode: 'focus' } })
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('expires automatically when until passes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    const listener = vi.fn()
    subscribeFocus(listener)
    setFocusFromUser({ status: { mode: 'focus', until: NOW + 5000 } })
    expect(getFocusActive()).toBe(true)
    vi.advanceTimersByTime(5001)
    expect(getFocusActive()).toBe(false)
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
