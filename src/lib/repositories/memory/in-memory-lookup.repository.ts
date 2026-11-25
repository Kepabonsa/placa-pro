// Author: Kevin Pabón
// internal imports
import type {
  CompleteLookupJobInputInterface,
  CreateLookupJobInputInterface,
  LookupJobInterface,
} from '@/interfaces/LookupJobInterface'
import type { InMemoryStore } from '@/lib/repositories/memory/in-memory.store'
import { InsufficientCreditsError, NotFoundError } from '@/lib/errors/app-error'
import type { LookupRepositoryInterface } from '@/lib/repositories/repositories.interface'

/** In-memory lookup_jobs with the same semantics as the credit RPCs in schema.sql. */
export class InMemoryLookupRepository implements LookupRepositoryInterface {
  constructor(
    private readonly store: InMemoryStore,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  async createWithCredits(input: CreateLookupJobInputInterface): Promise<LookupJobInterface> {
    const profile = this.store.profiles.get(input.userId)
    if (!profile) {
      throw new NotFoundError('No encontramos tu perfil. Vuelve a iniciar sesión.')
    }
    if (profile.creditBalance < input.credits) {
      throw new InsufficientCreditsError(
        `Créditos insuficientes: esta consulta cuesta ${input.credits} y tienes ${profile.creditBalance}.`,
      )
    }

    const now = this.clock().toISOString()
    const lookup: LookupJobInterface = {
      id: crypto.randomUUID(),
      userId: input.userId,
      plate: input.plate,
      ownerDocument: input.ownerDocument,
      queryMode: input.queryMode,
      status: 'pending',
      source: null,
      creditsCharged: input.credits,
      trafficLight: null,
      vehicleLabel: null,
      report: null,
      errorMessage: null,
      createdAt: now,
      completedAt: null,
    }
    this.store.lookups.set(lookup.id, lookup)

    if (input.credits > 0) {
      profile.creditBalance -= input.credits
      this.store.appendLedger({
        userId: input.userId,
        lookupId: lookup.id,
        delta: -input.credits,
        reason: 'lookup_charge',
        balanceAfter: profile.creditBalance,
        createdAt: now,
      })
    }
    return structuredClone(lookup)
  }

  async refundCredits(lookupId: string, reason: string): Promise<number> {
    const lookup = this.store.lookups.get(lookupId)
    if (!lookup) {
      throw new NotFoundError('No encontramos la consulta a reembolsar.')
    }
    if (lookup.status === 'refunded') {
      return 0
    }
    if (lookup.status === 'completed') {
      throw new Error(`Lookup ${lookupId} is completed and cannot be refunded`)
    }

    const now = this.clock().toISOString()
    lookup.status = 'refunded'
    lookup.errorMessage = reason
    lookup.completedAt = now

    const profile = this.store.profiles.get(lookup.userId)
    if (profile && lookup.creditsCharged > 0) {
      profile.creditBalance += lookup.creditsCharged
      this.store.appendLedger({
        userId: lookup.userId,
        lookupId: lookup.id,
        delta: lookup.creditsCharged,
        reason: 'lookup_refund',
        balanceAfter: profile.creditBalance,
        createdAt: now,
      })
    }
    return lookup.creditsCharged
  }

  async complete(
    lookupId: string,
    input: CompleteLookupJobInputInterface,
  ): Promise<LookupJobInterface> {
    const lookup = this.store.lookups.get(lookupId)
    if (!lookup || lookup.status !== 'pending') {
      throw new Error(`Lookup ${lookupId} is not pending`)
    }
    Object.assign(lookup, {
      status: 'completed',
      source: input.source,
      trafficLight: input.trafficLight,
      vehicleLabel: input.vehicleLabel,
      report: structuredClone(input.report),
      completedAt: this.clock().toISOString(),
    } satisfies Partial<LookupJobInterface>)
    return structuredClone(lookup)
  }

  async findLatestCompleted(userId: string, plate: string): Promise<LookupJobInterface | null> {
    let latest: LookupJobInterface | null = null
    // Map iteration follows insertion order, so the last match is the most recent lookup.
    for (const lookup of this.store.lookups.values()) {
      if (lookup.userId === userId && lookup.plate === plate && lookup.status === 'completed') {
        latest = lookup
      }
    }
    return latest ? structuredClone(latest) : null
  }
}
