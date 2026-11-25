// Author: Kevin Pabón
// internal imports
import { DealService } from '@/lib/services/deal.service'
import { LookupService } from '@/lib/services/lookup.service'
import { ProfileService } from '@/lib/services/profile.service'
import { PropertyCardService } from '@/lib/services/property-card.service'
import { RepositoryFactory } from '@/lib/repositories/repository.factory'
import { ServerEnv } from '@/lib/config/server-env'
import { VehicleProviderFactory } from '@/lib/providers/provider.factory'

/** Composition root: wires services with the configured provider and repositories. */
export class ServiceFactory {
  static lookupService(): LookupService {
    return new LookupService(VehicleProviderFactory.create(), RepositoryFactory.create())
  }

  static dealService(): DealService {
    return new DealService(RepositoryFactory.create())
  }

  static profileService(): ProfileService {
    return new ProfileService(RepositoryFactory.create())
  }

  static propertyCardService(): PropertyCardService {
    return new PropertyCardService(ServerEnv.get().MOCK_PROVIDER_LATENCY_MS)
  }
}
