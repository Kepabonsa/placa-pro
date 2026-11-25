// Author: Kevin Pabón
// internal imports
import type { VehicleLookupRequestInterface } from '@/interfaces/VehicleLookupInterface'
import type { VehicleProviderName } from '@/constants/domain'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'

/**
 * Contract every vehicle data source must fulfil (MockVehicleProvider today, PlacApiProvider in
 * Iteration 2). Services and UI depend only on this interface.
 */
export interface VehicleProviderInterface {
  readonly name: VehicleProviderName

  /**
   * Fetches and normalizes the report of a plate.
   * - `full`: plate + owner document (cheap query).
   * - `plate_only`: plate only (expensive query).
   * @param request - Plate, query mode and optional owner document.
   * @returns Normalized vehicle report.
   * @throws {ProviderNotFoundError} When the provider has no records for the plate.
   * @throws {ProviderTransientError} On timeouts, rate limits or 5xx responses (safe to retry).
   * @throws {ProviderResponseError} On any other unexpected provider response.
   */
  lookup(request: VehicleLookupRequestInterface): Promise<VehicleReportInterface>
}
