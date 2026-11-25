// Author: Kevin Pabón
// internal imports
import type { InMemoryStore } from '@/lib/repositories/memory/in-memory.store'
import type { VehicleCacheEntryInterface } from '@/interfaces/VehicleLookupInterface'
import type { VehicleCacheRepositoryInterface } from '@/lib/repositories/repositories.interface'

/** In-memory vehicle_cache. */
export class InMemoryVehicleCacheRepository implements VehicleCacheRepositoryInterface {
  constructor(private readonly store: InMemoryStore) {}

  async findFresh(plate: string, now: Date): Promise<VehicleCacheEntryInterface | null> {
    const entry = this.store.vehicleCache.get(plate)
    if (!entry || Date.parse(entry.expiresAt) <= now.getTime()) {
      return null
    }
    return structuredClone(entry)
  }

  async upsert(entry: VehicleCacheEntryInterface): Promise<void> {
    this.store.vehicleCache.set(entry.plate, structuredClone(entry))
  }
}
