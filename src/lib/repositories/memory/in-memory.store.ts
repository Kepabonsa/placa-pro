// Author: Kevin Pabón
// internal imports
import type { CreditLedgerEntryInterface } from '@/interfaces/CreditLedgerEntryInterface'
import type { DealInterface } from '@/interfaces/DealInterface'
import { DEMO_INITIAL_CREDITS, DEMO_USER } from '@/constants/domain'
import type { LookupJobInterface } from '@/interfaces/LookupJobInterface'
import type { ProfileInterface } from '@/interfaces/ProfileInterface'
import type { VehicleCacheEntryInterface } from '@/interfaces/VehicleLookupInterface'

/**
 * Demo-mode database (DATA_SOURCE=memory). Mirrors the Supabase tables; data is lost when the
 * server restarts.
 */
export class InMemoryStore {
  readonly profiles = new Map<string, ProfileInterface>()
  readonly vehicleCache = new Map<string, VehicleCacheEntryInterface>()
  readonly lookups = new Map<string, LookupJobInterface>()
  readonly deals = new Map<string, DealInterface>()
  readonly creditLedger: CreditLedgerEntryInterface[] = []

  /**
   * Store shared by every route of the running server process. Kept on globalThis so separate
   * route bundles and hot reloads see the same data.
   * @returns Shared store, seeded with the demo profile on first use.
   */
  static shared(): InMemoryStore {
    const globalScope = globalThis as typeof globalThis & { placaProMemoryStore?: InMemoryStore }
    globalScope.placaProMemoryStore ??= InMemoryStore.createSeeded()
    return globalScope.placaProMemoryStore
  }

  /**
   * Creates an isolated store with the demo profile and its initial credit grant.
   * @param initialCredits - Starting balance of the demo user.
   * @param now - Timestamp of the initial grant.
   * @returns New store.
   */
  static createSeeded(
    initialCredits: number = DEMO_INITIAL_CREDITS,
    now: Date = new Date(),
  ): InMemoryStore {
    const store = new InMemoryStore()
    store.profiles.set(DEMO_USER.id, {
      id: DEMO_USER.id,
      displayName: DEMO_USER.displayName,
      businessName: DEMO_USER.businessName,
      creditBalance: initialCredits,
    })
    if (initialCredits > 0) {
      store.appendLedger({
        userId: DEMO_USER.id,
        lookupId: null,
        delta: initialCredits,
        reason: 'initial_grant',
        balanceAfter: initialCredits,
        createdAt: now.toISOString(),
      })
    }
    return store
  }

  /**
   * Appends a credit movement with the next sequential id.
   * @param entry - Movement without id.
   * @returns Stored movement.
   */
  appendLedger(entry: Omit<CreditLedgerEntryInterface, 'id'>): CreditLedgerEntryInterface {
    const storedEntry = { ...entry, id: this.creditLedger.length + 1 }
    this.creditLedger.push(storedEntry)
    return storedEntry
  }
}
