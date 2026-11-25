// Author: Kevin Pabón
/** Colombian license plate helpers. */
export class PlateUtil {
  /** Cars use ABC123; motorcycles use ABC12D. */
  static readonly PATTERN = /^[A-Z]{3}\d{2}[A-Z\d]$/
  static readonly LENGTH = 6

  /**
   * Uppercases a plate and removes spaces, dashes and any other separator.
   * @param value - Raw plate typed or extracted by OCR.
   * @returns Normalized plate, e.g. "klm-482" → "KLM482".
   */
  static normalize(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  }

  /**
   * Formats a normalized plate for display, e.g. "KLM482" → "KLM 482".
   * @param plate - Normalized plate.
   * @returns Plate with a space between letters and numbers.
   */
  static format(plate: string): string {
    return plate.length === PlateUtil.LENGTH ? `${plate.slice(0, 3)} ${plate.slice(3)}` : plate
  }
}
