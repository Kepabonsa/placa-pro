// Author: Kevin Pabón
// external imports
import { describe, expect, it } from 'vitest'

// internal imports
import { MockVehicleFixtures } from '@/lib/providers/mock-vehicle.fixtures'
import { OFFER_DEFAULTS } from '@/constants/domain'
import { OfferUtil } from '@/utils/OfferUtil'

const REFERENCE_DATE = new Date('2026-11-25T15:00:00Z')

describe('OfferUtil.calculate', () => {
  it('subtracts debts, transfer, repairs and the target margin from the market value', () => {
    const calculation = OfferUtil.calculate({
      marketValue: 98_000_000,
      detectedDebts: 0,
      transferCost: 1_200_000,
      repairCosts: 0,
      targetMarginPercent: 10,
    })

    expect(calculation.marginAmount).toBe(9_800_000)
    expect(calculation.totalDeductions).toBe(11_000_000)
    expect(calculation.maxOffer).toBe(87_000_000)
    expect(calculation.isViable).toBe(true)
  })

  it('rounds the max offer down to the nearest $100.000', () => {
    const calculation = OfferUtil.calculate({
      marketValue: 50_000_000,
      detectedDebts: 123_456,
      transferCost: 0,
      repairCosts: 0,
      targetMarginPercent: 0,
    })

    expect(calculation.maxOffer).toBe(49_800_000)
  })

  it('supports decimal margins', () => {
    const calculation = OfferUtil.calculate({
      marketValue: 62_500_000,
      detectedDebts: 0,
      transferCost: 0,
      repairCosts: 0,
      targetMarginPercent: 12.5,
    })

    expect(calculation.marginAmount).toBe(7_812_500)
    expect(calculation.maxOffer).toBe(54_600_000)
  })

  it('returns 0 and flags the deal as not viable when deductions exceed the value', () => {
    const calculation = OfferUtil.calculate({
      marketValue: 10_000_000,
      detectedDebts: 4_000_000,
      transferCost: 1_200_000,
      repairCosts: 6_000_000,
      targetMarginPercent: 10,
    })

    expect(calculation.maxOffer).toBe(0)
    expect(calculation.isViable).toBe(false)
  })

  it('treats a break-even deal as not viable', () => {
    const calculation = OfferUtil.calculate({
      marketValue: 1_200_000,
      detectedDebts: 0,
      transferCost: 1_200_000,
      repairCosts: 0,
      targetMarginPercent: 0,
    })

    expect(calculation.maxOffer).toBe(0)
    expect(calculation.isViable).toBe(false)
  })
})

describe('OfferUtil.buildDefaultInput', () => {
  it('uses the Fasecolda value, the detected debts and sensible defaults', () => {
    const report = MockVehicleFixtures.build('JTR915', REFERENCE_DATE)
    if (!report) {
      throw new Error('Missing fixture JTR915')
    }

    const input = OfferUtil.buildDefaultInput(report)

    expect(input).toEqual({
      marketValue: 62_500_000,
      detectedDebts: 2_000_000,
      transferCost: OFFER_DEFAULTS.transferCost,
      repairCosts: OFFER_DEFAULTS.repairCosts,
      targetMarginPercent: OFFER_DEFAULTS.targetMarginPercent,
    })
    // 62.500.000 − 2.000.000 − 1.200.000 − 6.250.000 = 53.050.000 → 53.000.000
    expect(OfferUtil.calculate(input).maxOffer).toBe(53_000_000)
  })
})
