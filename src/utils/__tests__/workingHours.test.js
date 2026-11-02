import { describe, it, expect } from 'vitest'
import {
  formatOffsetDiff,
  getLocalTimeInfo,
  getTimezoneOffsetMinutes,
  getZonedParts,
  isValidTimeZone,
  isWithinWorkingHours,
  parseHm
} from '../workingHours'

// 2026-11-02T02:30:00Z is a Monday — 09:30 in Asia/Ho_Chi_Minh (UTC+7), 11:30 in Asia/Tokyo (UTC+9)
const NOW = new Date('2026-11-02T02:30:00Z')
const WH = { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] }

describe('parseHm', () => {
  it('parses HH:mm into minutes after midnight', () => {
    expect(parseHm('09:00')).toBe(540)
    expect(parseHm('23:59')).toBe(1439)
  })

  it('rejects malformed values', () => {
    expect(parseHm('9am')).toBeNull()
    expect(parseHm('25:00')).toBeNull()
    expect(parseHm(undefined)).toBeNull()
  })
})

describe('isValidTimeZone', () => {
  it('accepts IANA names and rejects garbage', () => {
    expect(isValidTimeZone('Asia/Ho_Chi_Minh')).toBe(true)
    expect(isValidTimeZone('Mars/Olympus')).toBe(false)
    expect(isValidTimeZone('')).toBe(false)
  })
})

describe('getZonedParts', () => {
  it('returns the wall clock and ISO weekday (1=Mon..7=Sun) in a timezone', () => {
    expect(getZonedParts(NOW, 'Asia/Ho_Chi_Minh')).toMatchObject({ hour: 9, minute: 30, weekday: 1 })
    expect(getZonedParts(NOW, 'America/Los_Angeles')).toMatchObject({ hour: 18, minute: 30, weekday: 7 })
  })

  it('reports midnight as hour 0', () => {
    expect(getZonedParts(new Date('2026-11-02T00:00:00Z'), 'UTC').hour).toBe(0)
  })
})

describe('isWithinWorkingHours', () => {
  it('handles regular daytime ranges', () => {
    expect(isWithinWorkingHours({ minutes: 9 * 60 + 30, weekday: 1 }, WH)).toBe(true)
    expect(isWithinWorkingHours({ minutes: 18 * 60, weekday: 1 }, WH)).toBe(false)
    expect(isWithinWorkingHours({ minutes: 10 * 60, weekday: 6 }, WH)).toBe(false)
  })

  it('handles overnight ranges attributing early hours to the previous day', () => {
    const night = { start: '22:00', end: '06:00', days: [1, 2, 3, 4, 5] }
    expect(isWithinWorkingHours({ minutes: 23 * 60, weekday: 5 }, night)).toBe(true)
    expect(isWithinWorkingHours({ minutes: 3 * 60, weekday: 6 }, night)).toBe(true) // Fri night shift
    expect(isWithinWorkingHours({ minutes: 3 * 60, weekday: 1 }, night)).toBe(false) // Sun night not working
    expect(isWithinWorkingHours({ minutes: 12 * 60, weekday: 2 }, night)).toBe(false)
  })

  it('returns false when working hours are missing or malformed', () => {
    expect(isWithinWorkingHours({ minutes: 600, weekday: 1 }, null)).toBe(false)
    expect(isWithinWorkingHours({ minutes: 600, weekday: 1 }, { start: 'x', end: '18:00' })).toBe(false)
  })
})

describe('timezone offsets', () => {
  it('computes the UTC offset of a zone in minutes', () => {
    expect(getTimezoneOffsetMinutes(NOW, 'Asia/Ho_Chi_Minh')).toBe(420)
    expect(getTimezoneOffsetMinutes(NOW, 'UTC')).toBe(0)
    expect(getTimezoneOffsetMinutes(NOW, 'Asia/Kolkata')).toBe(330)
  })

  it('formats offset differences', () => {
    expect(formatOffsetDiff(120)).toBe('+2h')
    expect(formatOffsetDiff(-90)).toBe('-1h 30m')
    expect(formatOffsetDiff(0)).toBe('')
  })
})

describe('getLocalTimeInfo', () => {
  it('describes local time, weekday and working state', () => {
    const info = getLocalTimeInfo({
      timeZone: 'Asia/Tokyo', workingHours: WH, now: NOW, viewerTimeZone: 'Asia/Ho_Chi_Minh', locale: 'en-US'
    })
    expect(info.timeZoneValid).toBe(true)
    expect(info.weekday).toBe(1)
    expect(info.isWorking).toBe(true)
    expect(info.hasWorkingHours).toBe(true)
    expect(info.offsetDiffMinutes).toBe(120)
    expect(info.offsetLabel).toBe('+2h')
    expect(info.timeString).toMatch(/11:30/)
  })

  it('falls back to UTC for an invalid timezone', () => {
    const info = getLocalTimeInfo({ timeZone: 'Nope/Zone', workingHours: WH, now: NOW, viewerTimeZone: 'UTC' })
    expect(info.timeZoneValid).toBe(false)
    expect(info.timeZone).toBe('UTC')
    expect(info.isWorking).toBe(false) // 02:30 UTC
  })

  it('reports no working-hours data when absent', () => {
    const info = getLocalTimeInfo({ timeZone: 'UTC', now: NOW, viewerTimeZone: 'UTC' })
    expect(info.hasWorkingHours).toBe(false)
    expect(info.isWorking).toBe(false)
  })
})
