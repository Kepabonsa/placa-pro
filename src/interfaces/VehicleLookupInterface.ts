// Author: Kevin Pabón
// internal imports
import type { DealInterface } from '@/interfaces/DealInterface'
import type { LookupSummaryInterface } from '@/interfaces/LookupJobInterface'
import type { QueryMode, VehicleProviderName } from '@/constants/domain'
import type { TrafficLightAssessmentInterface } from '@/interfaces/TrafficLightAssessmentInterface'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'

/** Request sent to a VehicleProviderInterface implementation. */
export interface VehicleLookupRequestInterface {
  plate: string
  mode: QueryMode
  ownerDocument: string | null
}

/** Entry of the shared provider cache (mirrors the vehicle_cache table). */
export interface VehicleCacheEntryInterface {
  plate: string
  provider: VehicleProviderName
  report: VehicleReportInterface
  fetchedAt: string
  expiresAt: string
}

/** Everything the report screen needs, returned by POST /api/lookups and GET /api/lookups/[plate]. */
export interface VehicleLookupResultInterface {
  lookup: LookupSummaryInterface
  report: VehicleReportInterface
  assessment: TrafficLightAssessmentInterface
  /** Instant used to evaluate expirations (ISO 8601). */
  evaluatedAt: string
  deal: DealInterface
  creditBalance: number
}

/** Data extracted from a photo of the tarjeta de propiedad. */
export interface PropertyCardExtractionInterface {
  plate: string
  ownerDocument: string
  confidence: number
}

/** Error body returned by every API route. */
export interface ApiErrorResponseInterface {
  error: {
    code: string
    message: string
  }
}
