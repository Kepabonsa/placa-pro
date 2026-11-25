// Author: Kevin Pabón
// internal imports
import type { InMemoryStore } from '@/lib/repositories/memory/in-memory.store'
import type { ProfileInterface } from '@/interfaces/ProfileInterface'
import type { ProfileRepositoryInterface } from '@/lib/repositories/repositories.interface'

/** In-memory profiles. */
export class InMemoryProfileRepository implements ProfileRepositoryInterface {
  constructor(private readonly store: InMemoryStore) {}

  async findOne(userId: string): Promise<ProfileInterface | null> {
    const profile = this.store.profiles.get(userId)
    return profile ? structuredClone(profile) : null
  }
}
