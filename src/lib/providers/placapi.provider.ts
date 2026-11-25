// Author: Kevin Pabón
// internal imports
import {
  ProviderNotFoundError,
  ProviderResponseError,
  ProviderTransientError,
} from '@/lib/providers/provider.errors'
import type { QueryMode, VehicleProviderName } from '@/constants/domain'
import type { VehicleLookupRequestInterface } from '@/interfaces/VehicleLookupInterface'
import type { VehicleProviderInterface } from '@/lib/providers/vehicle-provider.interface'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'

/**
 * Typed PlacApi skeleton (Iteration 2). HTTP handling, timeout and error classification are ready;
 * the endpoint paths and the response mapping must be confirmed against the PlacApi docs.
 */
export class PlacApiProvider implements VehicleProviderInterface {
  static readonly DEFAULT_TIMEOUT_MS = 45_000

  // TODO(iteration-2): confirm the real paths with PlacApi.
  private static readonly ENDPOINTS: Record<QueryMode, string> = {
    full: '/v1/vehicles/by-plate-and-document',
    plate_only: '/v1/vehicles/by-plate',
  }

  private static readonly TRANSIENT_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504])

  readonly name: VehicleProviderName = 'placapi'

  constructor(
    private readonly config: { baseUrl: string; apiKey: string; timeoutMs: number },
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  /**
   * Queries PlacApi. `full` sends plate + owner document (3 credits); `plate_only` sends the plate
   * (11 credits).
   * @param request - Plate, query mode and owner document (required in `full` mode).
   * @returns Normalized vehicle report.
   * @throws {ProviderTransientError} On timeout (default 45 s), network errors, 408/425/429/5xx.
   * @throws {ProviderNotFoundError} On 404.
   * @throws {ProviderResponseError} On other 4xx, invalid JSON or unmapped payloads.
   */
  async lookup(request: VehicleLookupRequestInterface): Promise<VehicleReportInterface> {
    const response = await this.send(request)

    if (response.status === 404) {
      throw new ProviderNotFoundError(`PlacApi has no records for ${request.plate}`)
    }
    if (PlacApiProvider.TRANSIENT_STATUS_CODES.has(response.status)) {
      throw new ProviderTransientError(`PlacApi answered ${response.status}`)
    }
    if (!response.ok) {
      throw new ProviderResponseError(`PlacApi rejected the request with ${response.status}`)
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch (error) {
      throw new ProviderResponseError('PlacApi returned invalid JSON', { cause: error })
    }
    return PlacApiProvider.mapReport(request, payload)
  }

  private async send(request: VehicleLookupRequestInterface): Promise<Response> {
    const url = new URL(PlacApiProvider.ENDPOINTS[request.mode], this.config.baseUrl)
    const body = JSON.stringify(PlacApiProvider.buildBody(request))
    try {
      return await this.fetcher(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(this.config.timeoutMs),
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        throw new ProviderTransientError(
          `PlacApi did not answer within ${this.config.timeoutMs} ms`,
          { cause: error },
        )
      }
      throw new ProviderTransientError('Network error while calling PlacApi', { cause: error })
    }
  }

  private static buildBody(request: VehicleLookupRequestInterface): Record<string, string> {
    if (request.mode === 'plate_only') {
      return { plate: request.plate }
    }
    if (!request.ownerDocument) {
      throw new ProviderResponseError('The full query mode requires the owner document')
    }
    return { plate: request.plate, document: request.ownerDocument }
  }

  private static mapReport(
    request: VehicleLookupRequestInterface,
    payload: unknown,
  ): VehicleReportInterface {
    // TODO(iteration-2): map the real PlacApi payload into VehicleReportInterface.
    throw new ProviderResponseError(
      `PlacApi response mapping is pending for ${request.plate} (${typeof payload} payload)`,
    )
  }
}
