// Author: Kevin Pabón
/** Date helpers anchored to Colombia's time zone. Date keys use the YYYY-MM-DD format. */
export class DateUtil {
  static readonly TIME_ZONE = 'America/Bogota'
  static readonly LOCALE = 'es-CO'

  private static readonly MS_PER_DAY = 86_400_000
  private static readonly MS_PER_HOUR = 3_600_000
  private static readonly DATE_KEY_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    timeZone: DateUtil.TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  private static readonly DATE_FORMATTER = new Intl.DateTimeFormat(DateUtil.LOCALE, {
    timeZone: DateUtil.TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  private static readonly DATE_TIME_FORMATTER = new Intl.DateTimeFormat(DateUtil.LOCALE, {
    timeZone: DateUtil.TIME_ZONE,
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })

  /**
   * Returns the Colombian calendar date of an instant.
   * @param date - Instant to convert.
   * @returns Date key (YYYY-MM-DD).
   */
  static toDateKey(date: Date): string {
    return DateUtil.DATE_KEY_FORMATTER.format(date)
  }

  /**
   * Adds calendar days to the Colombian date of an instant.
   * @param date - Reference instant.
   * @param days - Days to add (negative to go back).
   * @returns Date key (YYYY-MM-DD).
   */
  static addDays(date: Date, days: number): string {
    const base = DateUtil.parseDateKey(DateUtil.toDateKey(date))
    return new Date(base + days * DateUtil.MS_PER_DAY).toISOString().slice(0, 10)
  }

  /**
   * Adds hours to an instant.
   * @param date - Reference instant.
   * @param hours - Hours to add.
   * @returns New instant.
   */
  static addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * DateUtil.MS_PER_HOUR)
  }

  /**
   * Counts whole days between the Colombian date of `reference` and a date key.
   * @param dateKey - Target date (YYYY-MM-DD).
   * @param reference - Reference instant.
   * @returns Days until the target (negative when it already passed, 0 when it is today).
   */
  static daysUntil(dateKey: string, reference: Date): number {
    const target = DateUtil.parseDateKey(dateKey)
    const today = DateUtil.parseDateKey(DateUtil.toDateKey(reference))
    return Math.round((target - today) / DateUtil.MS_PER_DAY)
  }

  /**
   * Formats a date key for the UI, e.g. "13 dic 2026".
   * @param dateKey - Date (YYYY-MM-DD).
   * @returns Localized date.
   */
  static formatDate(dateKey: string): string {
    const middayUtc = DateUtil.parseDateKey(dateKey) + 12 * DateUtil.MS_PER_HOUR
    return DateUtil.DATE_FORMATTER.format(new Date(middayUtc))
  }

  /**
   * Formats an ISO instant for the UI, e.g. "25 nov, 4:30 p. m.".
   * @param isoDateTime - ISO 8601 instant.
   * @returns Localized date and time.
   */
  static formatDateTime(isoDateTime: string): string {
    return DateUtil.DATE_TIME_FORMATTER.format(new Date(isoDateTime))
  }

  private static parseDateKey(dateKey: string): number {
    return Date.parse(`${dateKey}T00:00:00Z`)
  }
}
