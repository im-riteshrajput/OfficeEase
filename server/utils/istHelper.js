/**
 * IST (Indian Standard Time) Helper
 * 
 * Converts UTC-based Date operations to IST (UTC+5:30).
 * Use these helpers everywhere instead of raw new Date() for date strings
 * or shift comparisons.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30 in milliseconds

/**
 * Get the current date-time in IST as a Date object.
 * NOTE: The returned Date object's internal UTC value is shifted to IST,
 * so use getUTC* methods (getUTCHours, getUTCFullYear, etc.) to read IST values.
 */
export function getNowIST() {
  const now = new Date();
  return new Date(now.getTime() + IST_OFFSET_MS);
}

/**
 * Get today's date string in IST as YYYY-MM-DD.
 */
export function getTodayIST() {
  const ist = getNowIST();
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get current IST hours and minutes (24h format).
 * Returns { hours, minutes }.
 */
export function getISTTime() {
  const ist = getNowIST();
  return {
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
  };
}

/**
 * Create a Date object representing a specific time on today's date in IST.
 * Useful for comparing shift start/end times against the current IST time.
 * @param {number} hours - Hour in 24h format (IST)
 * @param {number} minutes - Minutes
 * @returns {Date} - A Date whose getTime() can be compared with getNowIST().getTime()
 */
export function getISTDateWithTime(hours, minutes) {
  const ist = getNowIST();
  ist.setUTCHours(hours, minutes, 0, 0);
  return ist;
}

/**
 * Get the current year in IST.
 */
export function getISTYear() {
  return getNowIST().getUTCFullYear();
}

/**
 * Get the current month (0-indexed) in IST.
 */
export function getISTMonth() {
  return getNowIST().getUTCMonth();
}
