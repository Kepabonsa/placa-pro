// Author: Kevin Pabón
// external imports
import { describe, expect, it } from 'vitest'

// internal imports
import { CurrencyUtil } from '@/utils/CurrencyUtil'
import { DateUtil } from '@/utils/DateUtil'
import { PlateUtil } from '@/utils/PlateUtil'

describe('DateUtil (Colombia time zone)', () => {
  it('uses the Bogotá calendar date near midnight UTC', () => {
    // 22:00 on Nov 25 in Bogotá is already Nov 26 in UTC.
    const lateEvening = new Date('2026-11-26T03:00:00Z')

    expect(DateUtil.toDateKey(lateEvening)).toBe('2026-11-25')
    expect(DateUtil.addDays(lateEvening, 18)).toBe('2026-12-13')
    expect(DateUtil.daysUntil('2026-12-13', lateEvening)).toBe(18)
  })

  it('returns negative days for past dates and 0 for today', () => {
    const reference = new Date('2026-11-25T15:00:00Z')

    expect(DateUtil.daysUntil('2026-11-24', reference)).toBe(-1)
    expect(DateUtil.daysUntil('2026-11-25', reference)).toBe(0)
  })
})

describe('CurrencyUtil', () => {
  it('formats and parses Colombian pesos', () => {
    expect(CurrencyUtil.format(98_000_000).replace(/\s/g, ' ')).toBe('$ 98.000.000')
    expect(CurrencyUtil.formatDigits(1_160_000)).toBe('1.160.000')
    expect(CurrencyUtil.parse('$ 1.160.000')).toBe(1_160_000)
    expect(CurrencyUtil.parse('')).toBe(0)
  })
})

describe('PlateUtil', () => {
  it('normalizes and formats plates', () => {
    expect(PlateUtil.normalize(' jtr-915 ')).toBe('JTR915')
    expect(PlateUtil.format('JTR915')).toBe('JTR 915')
  })
})
