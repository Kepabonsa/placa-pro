// Author: Kevin Pabón
/** Editable inputs of the max offer calculator. Amounts in COP. */
export interface OfferCalculationInputInterface {
  marketValue: number
  detectedDebts: number
  transferCost: number
  repairCosts: number
  targetMarginPercent: number
}

/** Max offer = market value − debts − transfer − repairs − target margin. */
export interface OfferCalculationInterface {
  input: OfferCalculationInputInterface
  marginAmount: number
  totalDeductions: number
  maxOffer: number
  isViable: boolean
}
