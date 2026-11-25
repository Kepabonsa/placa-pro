// Author: Kevin Pabón
// external imports
import { describe, expect, it, vi } from 'vitest'

// internal imports
import { DateUtil } from '@/utils/DateUtil'
import { DealService } from '@/lib/services/deal.service'
import { DEMO_USER, MOCK_TRANSIENT_ERROR_PLATE } from '@/constants/domain'
import { InMemoryStore } from '@/lib/repositories/memory/in-memory.store'
import {
  InsufficientCreditsError,
  NotFoundError,
  ProviderUnavailableError,
} from '@/lib/errors/app-error'
import { LookupService } from '@/lib/services/lookup.service'
import { MockVehicleProvider } from '@/lib/providers/mock-vehicle.provider'
import { RepositoryFactory } from '@/lib/repositories/repository.factory'

const START = new Date('2026-11-25T15:00:00Z')
const userId = DEMO_USER.id

const setup = (
  initialCredits: number = 50,
): {
  store: InMemoryStore
  lookupService: LookupService
  dealService: DealService
  providerSpy: ReturnType<typeof vi.spyOn>
  advanceHours: (hours: number) => void
} => {
  let currentTime = START
  const clock = (): Date => currentTime
  const store = InMemoryStore.createSeeded(initialCredits, START)
  const repositories = RepositoryFactory.createInMemory(store, clock)
  const provider = new MockVehicleProvider(0, clock)
  return {
    store,
    lookupService: new LookupService(provider, repositories, clock),
    dealService: new DealService(repositories),
    providerSpy: vi.spyOn(provider, 'lookup'),
    advanceHours: (hours: number): void => {
      currentTime = DateUtil.addHours(currentTime, hours)
    },
  }
}

describe('LookupService.create — credits', () => {
  it('charges 3 credits for plate + owner document (full)', async () => {
    const { lookupService } = setup()

    const result = await lookupService.create(userId, {
      plate: 'KLM482',
      ownerDocument: '1020456789',
    })

    expect(result.lookup).toMatchObject({
      queryMode: 'full',
      source: 'provider',
      creditsCharged: 3,
    })
    expect(result.creditBalance).toBe(47)
    expect(result.assessment.status).toBe('green')
    expect(result.deal).toMatchObject({
      dealTag: 'new',
      marketValue: 98_000_000,
      maxOffer: 87_000_000,
    })
  })

  it('charges 11 credits for plate only', async () => {
    const { lookupService } = setup()

    const result = await lookupService.create(userId, { plate: 'JTR915' })

    expect(result.lookup).toMatchObject({ queryMode: 'plate_only', creditsCharged: 11 })
    expect(result.creditBalance).toBe(39)
    expect(result.assessment.status).toBe('yellow')
    expect(result.deal.detectedDebts).toBe(2_000_000)
  })

  it('serves a fresh cache entry (24 h) for free without calling the provider', async () => {
    const { lookupService, providerSpy } = setup()
    await lookupService.create(userId, { plate: 'BXZ304' })

    const cached = await lookupService.create(userId, { plate: 'BXZ304' })

    expect(cached.lookup).toMatchObject({ source: 'cache', creditsCharged: 0 })
    expect(cached.creditBalance).toBe(39)
    expect(cached.assessment.status).toBe('red')
    expect(providerSpy).toHaveBeenCalledTimes(1)
  })

  it('charges again once the cache expired', async () => {
    const { lookupService, providerSpy, advanceHours } = setup()
    await lookupService.create(userId, { plate: 'KLM482', ownerDocument: '1020456789' })
    advanceHours(25)

    const refreshed = await lookupService.create(userId, {
      plate: 'KLM482',
      ownerDocument: '1020456789',
    })

    expect(refreshed.lookup).toMatchObject({ source: 'provider', creditsCharged: 3 })
    expect(refreshed.creditBalance).toBe(44)
    expect(providerSpy).toHaveBeenCalledTimes(2)
  })

  it('rejects when the balance is too low without calling the provider', async () => {
    const { lookupService, providerSpy, store } = setup(10)

    await expect(lookupService.create(userId, { plate: 'JTR915' })).rejects.toThrow(
      new InsufficientCreditsError('Créditos insuficientes: esta consulta cuesta 11 y tienes 10.'),
    )
    expect(providerSpy).not.toHaveBeenCalled()
    expect(store.lookups.size).toBe(0)
  })
})

describe('LookupService.create — refunds', () => {
  it('refunds the credits when the provider fails transiently', async () => {
    const { lookupService, store } = setup()

    await expect(
      lookupService.create(userId, { plate: MOCK_TRANSIENT_ERROR_PLATE }),
    ).rejects.toThrow(ProviderUnavailableError)

    expect(store.profiles.get(userId)?.creditBalance).toBe(50)
    expect([...store.lookups.values()][0]?.status).toBe('refunded')
    expect(store.creditLedger.map((entry) => [entry.reason, entry.delta])).toEqual([
      ['initial_grant', 50],
      ['lookup_charge', -11],
      ['lookup_refund', 11],
    ])
  })

  it('refunds the credits and explains it when the plate has no records', async () => {
    const { lookupService, store } = setup()

    await expect(
      lookupService.create(userId, { plate: 'AAA111', ownerDocument: '1020456789' }),
    ).rejects.toThrow(
      new NotFoundError(
        'No encontramos registros para la placa AAA 111. Te devolvimos los 3 créditos.',
      ),
    )
    expect(store.profiles.get(userId)?.creditBalance).toBe(50)
  })
})

describe('LookupService — deals and re-opening', () => {
  it('keeps the user edits and tag when the plate is validated again', async () => {
    const { lookupService, dealService, advanceHours } = setup()
    await lookupService.create(userId, { plate: 'JTR915', ownerDocument: '43876512' })
    await dealService.update(userId, 'JTR915', { repairCosts: 2_000_000, dealTag: 'negotiating' })
    advanceHours(25)

    const again = await lookupService.create(userId, { plate: 'JTR915', ownerDocument: '43876512' })

    expect(again.deal).toMatchObject({ repairCosts: 2_000_000, dealTag: 'negotiating' })
    // 62.500.000 − 2.000.000 − 1.200.000 − 2.000.000 − 6.250.000 = 51.050.000 → 51.000.000
    expect(again.deal.maxOffer).toBe(51_000_000)
  })

  it('re-opens the latest report without charging credits', async () => {
    const { lookupService, providerSpy } = setup()
    const created = await lookupService.create(userId, {
      plate: 'KLM482',
      ownerDocument: '1020456789',
    })

    const reopened = await lookupService.findOne(userId, 'KLM482')

    expect(reopened.lookup.id).toBe(created.lookup.id)
    expect(reopened.creditBalance).toBe(47)
    expect(providerSpy).toHaveBeenCalledTimes(1)
  })

  it('throws NotFoundError for a plate the user never validated', async () => {
    const { lookupService } = setup()

    await expect(lookupService.findOne(userId, 'KLM482')).rejects.toThrow(
      new NotFoundError('Aún no has consultado la placa KLM 482.'),
    )
  })
})
