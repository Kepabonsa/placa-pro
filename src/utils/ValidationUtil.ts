// Author: Kevin Pabón
// external imports
import type { ZodError } from 'zod'

/** Helpers shared by the Zod DTO schemas and the API error mapping. */
export class ValidationUtil {
  /**
   * Treats empty form/query values as missing so optional fields stay optional.
   * @param value - Raw value.
   * @returns undefined for "", null or whitespace-only strings; the value otherwise.
   */
  static emptyToUndefined(value: unknown): unknown {
    if (value === null || (typeof value === 'string' && value.trim() === '')) {
      return undefined
    }
    return value
  }

  /**
   * Builds the Spanish message shown to the user for the first validation issue.
   * @param error - Zod validation error.
   * @returns Human readable message.
   */
  static formatZodError(error: ZodError): string {
    const issue = error.issues[0]
    if (!issue) {
      return 'Los datos enviados no son válidos.'
    }
    if (issue.code === 'unrecognized_keys') {
      return `Campo no permitido: ${issue.keys.join(', ')}.`
    }
    return issue.message
  }
}
