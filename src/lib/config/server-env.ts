// Author: Kevin Pabón
// external imports
import { z } from 'zod'

// internal imports
import { ConfigurationError } from '@/lib/errors/app-error'
import { DATA_SOURCES, VEHICLE_PROVIDERS } from '@/constants/domain'
import { PlacApiProvider } from '@/lib/providers/placapi.provider'

const ServerEnvSchema = z.object({
  VEHICLE_PROVIDER: z.enum(VEHICLE_PROVIDERS).default('mock'),
  MOCK_PROVIDER_LATENCY_MS: z.coerce.number().int().min(0).max(10_000).default(600),
  DATA_SOURCE: z.enum(DATA_SOURCES).default('memory'),
  PLACAPI_BASE_URL: z.url().optional(),
  PLACAPI_API_KEY: z.string().min(1).optional(),
  PLACAPI_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(120_000)
    .default(PlacApiProvider.DEFAULT_TIMEOUT_MS),
})

export type ServerEnvConfig = z.infer<typeof ServerEnvSchema>

/** Validated server-side environment (read from .env.local). */
export class ServerEnv {
  private static cachedConfig: ServerEnvConfig | null = null

  /**
   * Returns the validated environment, parsing process.env once.
   * @returns Server configuration.
   * @throws {ConfigurationError} When a variable has an invalid value.
   */
  static get(): ServerEnvConfig {
    ServerEnv.cachedConfig ??= ServerEnv.parse(process.env)
    return ServerEnv.cachedConfig
  }

  /**
   * Validates an environment object. Empty values count as missing.
   * @param source - Environment variables.
   * @returns Server configuration with defaults applied.
   * @throws {ConfigurationError} When a variable has an invalid value.
   */
  static parse(source: Record<string, string | undefined>): ServerEnvConfig {
    const cleaned = Object.fromEntries(
      Object.entries(source).filter(([, value]) => value !== undefined && value.trim() !== ''),
    )
    const result = ServerEnvSchema.safeParse(cleaned)
    if (!result.success) {
      const invalidKeys = result.error.issues.map((issue) => issue.path.join('.')).join(', ')
      throw new ConfigurationError(`Variables de entorno inválidas en .env.local: ${invalidKeys}.`)
    }
    return result.data
  }
}
