// Author: Kevin Pabón
// internal imports
import type { LookupSource, LookupStatus, QueryMode, TrafficLightStatus } from '@/constants/domain'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'

/** A plate query made by a user (mirrors the lookup_jobs table). */
export interface LookupJobInterface {
  id: string
  userId: string
  plate: string
  ownerDocument: string | null
  queryMode: QueryMode
  status: LookupStatus
  source: LookupSource | null
  creditsCharged: number
  trafficLight: TrafficLightStatus | null
  vehicleLabel: string | null
  report: VehicleReportInterface | null
  errorMessage: string | null
  createdAt: string
  completedAt: string | null
}

/** Input of the atomic "create lookup + debit credits" operation. */
export interface CreateLookupJobInputInterface {
  userId: string
  plate: string
  ownerDocument: string | null
  queryMode: QueryMode
  credits: number
}

/** Data stored when a lookup finishes successfully. */
export interface CompleteLookupJobInputInterface {
  report: VehicleReportInterface
  source: LookupSource
  trafficLight: TrafficLightStatus
  vehicleLabel: string
}

/** Lookup data safe to send to the browser. */
export interface LookupSummaryInterface {
  id: string
  plate: string
  queryMode: QueryMode
  source: LookupSource | null
  creditsCharged: number
  createdAt: string
}
