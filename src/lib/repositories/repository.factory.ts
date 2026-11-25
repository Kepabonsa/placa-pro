// Author: Kevin Pabón
// internal imports
import { ConfigurationError } from '@/lib/errors/app-error'
import { InMemoryDealRepository } from '@/lib/repositories/memory/in-memory-deal.repository'
import { InMemoryLookupRepository } from '@/lib/repositories/memory/in-memory-lookup.repository'
import { InMemoryProfileRepository } from '@/lib/repositories/memory/in-memory-profile.repository'
import { InMemoryStore } from '@/lib/repositories/memory/in-memory.store'
import { InMemoryVehicleCacheRepository } from '@/lib/repositories/memory/in-memory-vehicle-cache.repository'
import type { RepositoriesInterface } from '@/lib/repositories/repositories.interface'
import { ServerEnv } from '@/lib/config/server-env'
import type { ServerEnvConfig } from '@/lib/config/server-env'

/** Selects the persistence layer with DATA_SOURCE=memory|supabase. */
export class RepositoryFactory {
  /**
   * Creates the configured repositories.
   * @param config - Server environment (defaults to the validated process env).
   * @returns Repositories bundle.
   * @throws {ConfigurationError} When DATA_SOURCE=supabase (connected in Iteration 2).
   */
  static create(config: ServerEnvConfig = ServerEnv.get()): RepositoriesInterface {
    if (config.DATA_SOURCE === 'supabase') {
      throw new ConfigurationError(
        'DATA_SOURCE=supabase se conecta en la Iteración 2. Usa DATA_SOURCE=memory por ahora.',
      )
    }
    return RepositoryFactory.createInMemory(InMemoryStore.shared())
  }

  /**
   * Builds in-memory repositories over a store (used by demo mode and tests).
   * @param store - Backing store.
   * @param clock - Time source.
   * @returns Repositories bundle.
   */
  static createInMemory(
    store: InMemoryStore,
    clock: () => Date = () => new Date(),
  ): RepositoriesInterface {
    return {
      lookups: new InMemoryLookupRepository(store, clock),
      vehicleCache: new InMemoryVehicleCacheRepository(store),
      deals: new InMemoryDealRepository(store, clock),
      profiles: new InMemoryProfileRepository(store),
    }
  }
}
