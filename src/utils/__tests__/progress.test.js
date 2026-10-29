import { describe, it, expect } from 'vitest'
import {
  PROGRESS_OPTIONS,
  snapProgress,
  progressToPercent,
  formatProgress,
  getProgressColor
} from '../progress'

describe('progress helpers', () => {
  it('offers 11 options from 0% to 100% in 10% steps', () => {
    expect(PROGRESS_OPTIONS).toHaveLength(11)
    expect(PROGRESS_OPTIONS[0]).toEqual({ percent: 0, value: 0, label: '0%' })
    expect(PROGRESS_OPTIONS[10]).toEqual({ percent: 100, value: 1, label: '100%' })
    PROGRESS_OPTIONS.forEach((opt, i) => expect(opt.percent).toBe(i * 10))
  })

  it('snaps fractions to the nearest 10% step', () => {
    expect(snapProgress(0.74)).toBe(0.7)
    expect(snapProgress(0.76)).toBe(0.8)
    expect(snapProgress('0.5')).toBe(0.5)
    expect(snapProgress(1)).toBe(1)
  })

  it('accepts percent numbers and strings', () => {
    expect(snapProgress(70)).toBe(0.7)
    expect(snapProgress('70%')).toBe(0.7)
    expect(snapProgress('  35 % ')).toBe(0.4)
    expect(snapProgress('0,6')).toBe(0.6)
  })

  it('clamps and falls back to 0 on invalid input', () => {
    expect(snapProgress(250)).toBe(1)
    expect(snapProgress(-5)).toBe(0)
    expect(snapProgress('abc')).toBe(0)
    expect(snapProgress(null)).toBe(0)
    expect(snapProgress(undefined)).toBe(0)
    expect(snapProgress('')).toBe(0)
  })

  it('formats progress as a percent label', () => {
    expect(progressToPercent(0.3)).toBe(30)
    expect(formatProgress(0.3)).toBe('30%')
    expect(formatProgress('100')).toBe('100%')
  })

  it('maps progress to a stable color scale', () => {
    expect(getProgressColor(0)).toBe('#94a3b8')
    expect(getProgressColor(0.2)).toBe('#fb7185')
    expect(getProgressColor(0.5)).toBe('#f59e0b')
    expect(getProgressColor(0.8)).toBe('#22c55e')
    expect(getProgressColor(1)).toBe('#10b981')
  })
})
