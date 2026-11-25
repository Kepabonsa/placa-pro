// Author: Kevin Pabón
// internal imports
import { NotFoundError } from '@/lib/errors/app-error'
import type { ProfileInterface } from '@/interfaces/ProfileInterface'
import type { RepositoriesInterface } from '@/lib/repositories/repositories.interface'

/** Dealer profile and credit balance. */
export class ProfileService {
  constructor(private readonly repositories: RepositoriesInterface) {}

  /**
   * Returns the profile of the authenticated user.
   * @param userId - Authenticated user.
   * @returns Profile with its credit balance.
   * @throws {NotFoundError} When the profile does not exist.
   */
  async findOne(userId: string): Promise<ProfileInterface> {
    const profile = await this.repositories.profiles.findOne(userId)
    if (!profile) {
      throw new NotFoundError('No encontramos tu perfil.')
    }
    return profile
  }
}
