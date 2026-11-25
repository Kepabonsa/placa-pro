// Author: Kevin Pabón
// internal imports
import type { DealTag, TrafficLightStatus } from '@/constants/domain'
import type { OfferCalculationInputInterface } from '@/interfaces/OfferCalculationInterface'

/** A user's negotiation for a plate (mirrors the deal_calculations table). */
export interface DealInterface extends OfferCalculationInputInterface {
  id: string
  userId: string
  plate: string
  lookupId: string | null
  maxOffer: number
  dealTag: DealTag
  createdAt: string
  updatedAt: string
}

/** Fields persisted when a deal is created or updated. */
export interface SaveDealInputInterface extends OfferCalculationInputInterface {
  userId: string
  plate: string
  lookupId: string | null
  maxOffer: number
  dealTag: DealTag
}

/** Row of the history screen: the deal joined with its latest lookup. */
export interface DealHistoryItemInterface {
  plate: string
  vehicleLabel: string | null
  trafficLight: TrafficLightStatus | null
  dealTag: DealTag
  maxOffer: number
  lastLookupAt: string | null
  updatedAt: string
}

export interface DealHistoryFiltersInterface {
  plate?: string
  dealTag?: DealTag
  limit?: number
}
