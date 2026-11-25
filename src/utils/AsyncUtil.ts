// Author: Kevin Pabón
/** Promise helpers. */
export class AsyncUtil {
  /**
   * Waits the given time (no-op for zero or negative values).
   * @param milliseconds - Delay.
   * @returns Promise resolved after the delay.
   */
  static async wait(milliseconds: number): Promise<void> {
    if (milliseconds <= 0) {
      return
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }
}
