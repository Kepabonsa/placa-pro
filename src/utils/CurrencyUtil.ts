// Author: Kevin Pabón
/** Colombian peso (COP) formatting and parsing. */
export class CurrencyUtil {
  private static readonly CURRENCY_FORMATTER = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  private static readonly DIGITS_FORMATTER = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
    useGrouping: 'always',
  })

  /**
   * Formats an amount as COP, e.g. "$ 98.000.000".
   * @param amount - Amount in pesos.
   * @returns Formatted amount.
   */
  static format(amount: number): string {
    return CurrencyUtil.CURRENCY_FORMATTER.format(amount)
  }

  /**
   * Formats an amount with thousands separators and no symbol, e.g. "98.000.000".
   * @param amount - Amount in pesos.
   * @returns Formatted digits.
   */
  static formatDigits(amount: number): string {
    return CurrencyUtil.DIGITS_FORMATTER.format(amount)
  }

  /**
   * Reads the digits typed in a money input ("98.000.000" → 98000000).
   * @param text - Raw input text.
   * @returns Integer amount (0 when there are no digits).
   */
  static parse(text: string): number {
    const digits = text.replace(/\D/g, '')
    return digits === '' ? 0 : Number(digits)
  }
}
