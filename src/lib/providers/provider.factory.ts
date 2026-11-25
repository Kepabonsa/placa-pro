// Author: Kevin Pabón
// internal imports
import { ConfigurationError } from '@/lib/errors/app-error'
import { MockVehicleProvider } from '@/lib/providers/mock-vehicle.provider'
import { PlacApiProvider } from '@/lib/providers/placapi.provider'
import { ServerEnv } from '@/lib/config/server-env'
import type { ServerEnvConfig } from '@/lib/config/server-env'
import type { VehicleProviderInterface } from '@/lib/providers/vehicle-provider.interface'

/** Selects the vehicle provider with VEHICLE_PROVIDER=mock|placapi. */
export class VehicleProviderFactory {
  /**
   * Creates the configured provider.
   * @param config - Server environment (defaults to the validated process env).
   * @returns Provider implementation.
   * @throws {ConfigurationError} When placapi is selected without its credentials.
   */
  static create(config: ServerEnvConfig = ServerEnv.get()): VehicleProviderInterface {
    if (config.VEHICLE_PROVIDER === 'mock') {
      return new MockVehicleProvider(config.MOCK_PROVIDER_LATENCY_MS)
    }

    if (!config.PLACAPI_BASE_URL || !config.PLACAPI_API_KEY) {
      throw new ConfigurationError(
        'Configura PLACAPI_BASE_URL y PLACAPI_API_KEY en .env.local para usar VEHICLE_PROVIDER=placapi.',
      )
    }
    return new PlacApiProvider({
      baseUrl: config.PLACAPI_BASE_URL,
      apiKey: config.PLACAPI_API_KEY,
      timeoutMs: config.PLACAPI_TIMEOUT_MS,
    })
  }
}
