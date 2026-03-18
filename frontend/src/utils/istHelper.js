/**
 * IST (Indian Standard Time) Helper for Frontend
 * 
 * Converts UTC-based Date operations to IST (UTC+5:30).
 * Use getTodayIST() instead of new Date().toISOString().split('T')[0]
 * to get the correct IST date string.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Get today's date in IST as YYYY-MM-DD string.
 */
export function getTodayIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const day = String(ist.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
