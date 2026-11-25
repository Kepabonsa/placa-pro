// Author: Kevin Pabón
// internal imports
import type {
  CompleteLookupJobInputInterface,
  CreateLookupJobInputInterface,
  LookupJobInterface,
} from '@/interfaces/LookupJobInterface'
import type {
  DealHistoryFiltersInterface,
  DealHistoryItemInterface,
  DealInterface,
  SaveDealInputInterface,
} from '@/interfaces/DealInterface'
import type { ProfileInterface } from '@/interfaces/ProfileInterface'
import type { VehicleCacheEntryInterface } from '@/interfaces/VehicleLookupInterface'

/** lookup_jobs + the credit RPCs (create_lookup_with_credits / refund_lookup_credits). */
export interface LookupRepositoryInterface {
  /**
   * Atomically debits credits, writes the ledger and creates a pending lookup.
   * @throws {InsufficientCreditsError} When the balance does not cover `credits`.
   * @throws {NotFoundError} When the profile does not exist.
   */
  createWithCredits(input: CreateLookupJobInputInterface): Promise<LookupJobInterface>

  /**
   * Returns the credits of a non-completed lookup. Idempotent.
   * @returns Credits refunded (0 when it was already refunded).
   */
  refundCredits(lookupId: string, reason: string): Promise<number>

  complete(lookupId: string, input: CompleteLookupJobInputInterface): Promise<LookupJobInterface>

  findLatestCompleted(userId: string, plate: string): Promise<LookupJobInterface | null>
}

/** vehicle_cache (shared across users, server-only). */
export interface VehicleCacheRepositoryInterface {
  findFresh(plate: string, now: Date): Promise<VehicleCacheEntryInterface | null>
  upsert(entry: VehicleCacheEntryInterface): Promise<void>
}

/** deal_calculations (one negotiation per user and plate). */
export interface DealRepositoryInterface {
  findOne(userId: string, plate: string): Promise<DealInterface | null>
  save(input: SaveDealInputInterface): Promise<DealInterface>
  findAll(userId: string, filters: DealHistoryFiltersInterface): Promise<DealHistoryItemInterface[]>
}

/** profiles. */
export interface ProfileRepositoryInterface {
  findOne(userId: string): Promise<ProfileInterface | null>
}

export interface RepositoriesInterface {
  lookups: LookupRepositoryInterface
  vehicleCache: VehicleCacheRepositoryInterface
  deals: DealRepositoryInterface
  profiles: ProfileRepositoryInterface
}
