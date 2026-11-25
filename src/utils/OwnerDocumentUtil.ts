// Author: Kevin Pabón
/** Owner identification document (cédula) helpers. */
export class OwnerDocumentUtil {
  static readonly PATTERN = /^\d{5,10}$/

  private static readonly VISIBLE_DIGITS = 4

  /**
   * Keeps only the digits of a document ("1.020.456.789" → "1020456789").
   * @param value - Raw document.
   * @returns Digits only.
   */
  static normalize(value: string): string {
    return value.replace(/\D/g, '')
  }

  /**
   * Hides all but the last digits of a document for display.
   * @param document - Normalized document.
   * @returns Masked document, e.g. "•••6789".
   */
  static mask(document: string): string {
    if (document.length <= OwnerDocumentUtil.VISIBLE_DIGITS) {
      return document
    }
    return `•••${document.slice(-OwnerDocumentUtil.VISIBLE_DIGITS)}`
  }
}
