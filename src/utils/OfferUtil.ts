// Author: Kevin Pabón
// internal imports
import { OFFER_DEFAULTS, OFFER_ROUNDING_STEP } from '@/constants/domain'
import type {
  OfferCalculationInputInterface,
  OfferCalculationInterface,
} from '@/interfaces/OfferCalculationInterface'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'
import { VehicleReportUtil } from '@/utils/VehicleReportUtil'

/** Max offer calculator shared by the UI (live preview) and the server (persisted value). */
export class OfferUtil {
  /**
   * Calculates the max offer: market value − detected debts − transfer − repairs − target margin.
   * The result is rounded down to OFFER_ROUNDING_STEP and never goes below zero.
   * @param input - Calculator inputs in COP; margin as a percentage of the market value.
   * @returns Breakdown and max offer.
   */
  static calculate(input: OfferCalculationInputInterface): OfferCalculationInterface {
    const marginAmount = Math.round((input.marketValue * input.targetMarginPercent) / 100)
    const totalDeductions =
      input.detectedDebts + input.transferCost + input.repairCosts + marginAmount
    const rawOffer = input.marketValue - totalDeductions
    const maxOffer =
      rawOffer > 0 ? Math.floor(rawOffer / OFFER_ROUNDING_STEP) * OFFER_ROUNDING_STEP : 0

    return { input, marginAmount, totalDeductions, maxOffer, isViable: rawOffer > 0 }
  }

  /**
   * Default calculator inputs for a fresh report (Fasecolda value as market value).
   * @param report - Vehicle report.
   * @returns Calculator inputs.
   */
  static buildDefaultInput(report: VehicleReportInterface): OfferCalculationInputInterface {
    return {
      marketValue: report.fasecolda.referenceValue,
      detectedDebts: VehicleReportUtil.getDetectedDebts(report),
      transferCost: OFFER_DEFAULTS.transferCost,
      repairCosts: OFFER_DEFAULTS.repairCosts,
      targetMarginPercent: OFFER_DEFAULTS.targetMarginPercent,
    }
  }
}
