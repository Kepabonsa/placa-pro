// Author: Kevin Pabón
// external imports
import { describe, expect, it, vi } from 'vitest'

// internal imports
import { ConfigurationError } from '@/lib/errors/app-error'
import { MockVehicleProvider } from '@/lib/providers/mock-vehicle.provider'
import { PlacApiProvider } from '@/lib/providers/placapi.provider'
import {
  ProviderNotFoundError,
  ProviderResponseError,
  ProviderTransientError,
} from '@/lib/providers/provider.errors'
import { ServerEnv } from '@/lib/config/server-env'
import { VehicleProviderFactory } from '@/lib/providers/provider.factory'

const CONFIG = { baseUrl: 'https://api.placapi.test', apiKey: 'test-key', timeoutMs: 50 }

const respondWith = (status: number): ReturnType<typeof vi.fn<typeof fetch>> =>
  vi.fn<typeof fetch>(async () => new Response('{}', { status }))

describe('PlacApiProvider', () => {
  it('sends plate + document to the full endpoint', async () => {
    const fetcher = respondWith(200)
    const provider = new PlacApiProvider(CONFIG, fetcher)

    // The payload mapping is pending (Iteration 2), so a 200 still ends in ProviderResponseError.
    await expect(
      provider.lookup({ plate: 'KLM482', mode: 'full', ownerDocument: '1020456789' }),
    ).rejects.toThrow(ProviderResponseError)

    const [url, init] = fetcher.mock.calls[0] ?? []
    expect(String(url)).toBe('https://api.placapi.test/v1/vehicles/by-plate-and-document')
    expect(JSON.parse(String(init?.body))).toEqual({ plate: 'KLM482', document: '1020456789' })
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer test-key')
  })

  it('sends only the plate in plate_only mode', async () => {
    const fetcher = respondWith(200)
    const provider = new PlacApiProvider(CONFIG, fetcher)

    await expect(
      provider.lookup({ plate: 'JTR915', mode: 'plate_only', ownerDocument: null }),
    ).rejects.toThrow(ProviderResponseError)

    const [url, init] = fetcher.mock.calls[0] ?? []
    expect(String(url)).toBe('https://api.placapi.test/v1/vehicles/by-plate')
    expect(JSON.parse(String(init?.body))).toEqual({ plate: 'JTR915' })
  })

  it('refuses the full mode without owner document and does not call the API', async () => {
    const fetcher = respondWith(200)
    const provider = new PlacApiProvider(CONFIG, fetcher)

    await expect(
      provider.lookup({ plate: 'KLM482', mode: 'full', ownerDocument: null }),
    ).rejects.toThrow(ProviderResponseError)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('maps 404 to ProviderNotFoundError', async () => {
    const provider = new PlacApiProvider(CONFIG, respondWith(404))
    await expect(
      provider.lookup({ plate: 'AAA111', mode: 'plate_only', ownerDocument: null }),
    ).rejects.toThrow(ProviderNotFoundError)
  })

  it.each([408, 429, 500, 503])('maps %i to ProviderTransientError', async (status) => {
    const provider = new PlacApiProvider(CONFIG, respondWith(status))
    await expect(
      provider.lookup({ plate: 'AAA111', mode: 'plate_only', ownerDocument: null }),
    ).rejects.toThrow(ProviderTransientError)
  })

  it('maps other 4xx to ProviderResponseError', async () => {
    const provider = new PlacApiProvider(CONFIG, respondWith(401))
    await expect(
      provider.lookup({ plate: 'AAA111', mode: 'plate_only', ownerDocument: null }),
    ).rejects.toThrow(ProviderResponseError)
  })

  it('turns a timeout into ProviderTransientError', async () => {
    const hangingFetcher = vi.fn<typeof fetch>(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )
    const provider = new PlacApiProvider(CONFIG, hangingFetcher)

    await expect(
      provider.lookup({ plate: 'KLM482', mode: 'plate_only', ownerDocument: null }),
    ).rejects.toThrow(new ProviderTransientError('PlacApi did not answer within 50 ms'))
  })

  it('turns network errors into ProviderTransientError', async () => {
    const failingFetcher = vi.fn<typeof fetch>(async () => {
      throw new TypeError('fetch failed')
    })
    const provider = new PlacApiProvider(CONFIG, failingFetcher)

    await expect(
      provider.lookup({ plate: 'KLM482', mode: 'plate_only', ownerDocument: null }),
    ).rejects.toThrow(ProviderTransientError)
  })
})

describe('VehicleProviderFactory', () => {
  it('uses the mock provider by default with a 45 s PlacApi timeout configured', () => {
    const config = ServerEnv.parse({})

    expect(config.PLACAPI_TIMEOUT_MS).toBe(45_000)
    expect(VehicleProviderFactory.create(config)).toBeInstanceOf(MockVehicleProvider)
  })

  it('requires PlacApi credentials when VEHICLE_PROVIDER=placapi', () => {
    expect(() =>
      VehicleProviderFactory.create(ServerEnv.parse({ VEHICLE_PROVIDER: 'placapi' })),
    ).toThrow(ConfigurationError)
  })

  it('creates PlacApiProvider when VEHICLE_PROVIDER=placapi is configured', () => {
    const config = ServerEnv.parse({
      VEHICLE_PROVIDER: 'placapi',
      PLACAPI_BASE_URL: 'https://api.placapi.test',
      PLACAPI_API_KEY: 'test-key',
      PLACAPI_TIMEOUT_MS: '',
    })

    expect(VehicleProviderFactory.create(config)).toBeInstanceOf(PlacApiProvider)
  })

  it('rejects invalid environment values', () => {
    expect(() => ServerEnv.parse({ VEHICLE_PROVIDER: 'runt' })).toThrow(
      new ConfigurationError('Variables de entorno inválidas en .env.local: VEHICLE_PROVIDER.'),
    )
  })
})
