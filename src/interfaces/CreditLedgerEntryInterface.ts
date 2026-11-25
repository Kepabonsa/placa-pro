// Author: Kevin Pabón
// internal imports
import type { CreditLedgerReason } from '@/constants/domain'

/** Append-only credit movement (mirrors the credit_ledger table). */
export interface CreditLedgerEntryInterface {
  id: number
  userId: string
  lookupId: string | null
  delta: number
  reason: CreditLedgerReason
  balanceAfter: number
  createdAt: string
}
