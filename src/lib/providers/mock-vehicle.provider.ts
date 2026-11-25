// Author: Kevin Pabón
// internal imports
import { AsyncUtil } from '@/utils/AsyncUtil'
import { MOCK_TRANSIENT_ERROR_PLATE } from '@/constants/domain'
import { MockVehicleFixtures } from '@/lib/providers/mock-vehicle.fixtures'
import { ProviderNotFoundError, ProviderTransientError } from '@/lib/providers/provider.errors'
import type { VehicleLookupRequestInterface } from '@/interfaces/VehicleLookupInterface'
import type { VehicleProviderInterface } from '@/lib/providers/vehicle-provider.interface'
import type { VehicleProviderName } from '@/constants/domain'
import type { VehicleReportInterface } from '@/interfaces/VehicleReportInterface'

/** In-memory provider with the Colombian test plates. Simulates network latency. */
export class MockVehicleProvider implements VehicleProviderInterface {
  readonly name: VehicleProviderName = 'mock'

  constructor(
    private readonly latencyMs: number,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  /**
   * Returns the fixture report of a test plate.
   * @param request - Plate and query mode (the owner document is not validated by the mock).
   * @returns Vehicle report.
   * @throws {ProviderTransientError} For the MOCK_TRANSIENT_ERROR_PLATE plate.
   * @throws {ProviderNotFoundError} For any plate that is not a test plate.
   */
  async lookup(request: VehicleLookupRequestInterface): Promise<VehicleReportInterface> {
    await AsyncUtil.wait(this.latencyMs)

    if (request.plate === MOCK_TRANSIENT_ERROR_PLATE) {
      throw new ProviderTransientError(`Simulated provider timeout for ${request.plate}`)
    }

    const report = MockVehicleFixtures.build(request.plate, this.clock())
    if (!report) {
      throw new ProviderNotFoundError(`Mock provider has no records for ${request.plate}`)
    }
    return report
  }
}
