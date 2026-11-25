// Author: Kevin Pabón
// external imports
import { useEffect, useState } from 'react'

/**
 * Returns `value` after it stops changing for `delayMs`.
 * @param value - Fast-changing value (e.g. a search input).
 * @param delayMs - Quiet period before publishing the value.
 * @returns Debounced value.
 */
export function useDebouncedValue<TValue>(value: TValue, delayMs: number): TValue {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)
    return (): void => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
