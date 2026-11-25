// Author: Kevin Pabón
// external imports
import { connection } from 'next/server'

// internal imports
import { ConfigurationError } from '@/lib/errors/app-error'
import { DEMO_USER } from '@/constants/domain'
import { ServerEnv } from '@/lib/config/server-env'
import type { SessionUserInterface } from '@/interfaces/ProfileInterface'

/** Resolves the authenticated user of a request. */
export class SessionService {
  /**
   * Returns the session user. In demo mode (DATA_SOURCE=memory) every request belongs to the demo
   * dealer. Calls connection() so GET handlers always run at request time (Cache Components).
   * @returns Session user.
   * @throws {ConfigurationError} When DATA_SOURCE=supabase (Supabase Auth arrives in Iteration 2).
   */
  static async requireUser(): Promise<SessionUserInterface> {
    await connection()
    if (ServerEnv.get().DATA_SOURCE === 'supabase') {
      throw new ConfigurationError(
        'La sesión con Supabase Auth se conecta en la Iteración 2. Usa DATA_SOURCE=memory.',
      )
    }
    return { id: DEMO_USER.id, displayName: DEMO_USER.displayName }
  }
}
