// Author: Kevin Pabón
// internal imports
import type {
  DealHistoryFiltersInterface,
  DealHistoryItemInterface,
  DealInterface,
  SaveDealInputInterface,
} from '@/interfaces/DealInterface'
import type { DealRepositoryInterface } from '@/lib/repositories/repositories.interface'
import type { InMemoryStore } from '@/lib/repositories/memory/in-memory.store'

/** In-memory deal_calculations, unique per (userId, plate). */
export class InMemoryDealRepository implements DealRepositoryInterface {
  private static readonly DEFAULT_LIMIT = 50

  constructor(
    private readonly store: InMemoryStore,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async findOne(userId: string, plate: string): Promise<DealInterface | null> {
    const deal = this.store.deals.get(InMemoryDealRepository.buildKey(userId, plate))
    return deal ? structuredClone(deal) : null
  }

  async save(input: SaveDealInputInterface): Promise<DealInterface> {
    const key = InMemoryDealRepository.buildKey(input.userId, input.plate)
    const existing = this.store.deals.get(key)
    const now = this.clock().toISOString()
    const deal: DealInterface = existing
      ? { ...existing, ...input, updatedAt: now }
      : { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    this.store.deals.set(key, deal)
    return structuredClone(deal)
  }

  async findAll(
    userId: string,
    filters: DealHistoryFiltersInterface,
  ): Promise<DealHistoryItemInterface[]> {
    return [...this.store.deals.values()]
      .filter(
        (deal) =>
          deal.userId === userId &&
          (!filters.plate || deal.plate.includes(filters.plate)) &&
          (!filters.dealTag || deal.dealTag === filters.dealTag),
      )
      .toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, filters.limit ?? InMemoryDealRepository.DEFAULT_LIMIT)
      .map((deal) => {
        const lookup = deal.lookupId ? this.store.lookups.get(deal.lookupId) : undefined
        return {
          plate: deal.plate,
          vehicleLabel: lookup?.vehicleLabel ?? null,
          trafficLight: lookup?.trafficLight ?? null,
          dealTag: deal.dealTag,
          maxOffer: deal.maxOffer,
          lastLookupAt: lookup?.completedAt ?? null,
          updatedAt: deal.updatedAt,
        }
      })
  }

  private static buildKey(userId: string, plate: string): string {
    return `${userId}:${plate}`
  }
}
