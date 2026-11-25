// Author: Kevin Pabón
// internal imports
import { HttpClientService } from '@/services/HttpClientService'
import type { ProfileInterface } from '@/interfaces/ProfileInterface'

/** Bridge to /api/profile. */
export class ProfileApiService {
  static async findOne(): Promise<ProfileInterface> {
    return HttpClientService.get<ProfileInterface>('/api/profile')
  }
}
