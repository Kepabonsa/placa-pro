// Author: Kevin Pabón
/** Dealer profile and current credit balance (mirrors the profiles table). */
export interface ProfileInterface {
  id: string
  displayName: string
  businessName: string | null
  creditBalance: number
}

/** Authenticated user resolved from the session. */
export interface SessionUserInterface {
  id: string
  displayName: string
}
