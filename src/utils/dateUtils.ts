/**
 * Date calculation and formatting utilities for Celebrio AI.
 */

/**
 * Subtracts a given number of days from an ISO date string ('YYYY-MM-DD') or Date object.
 * Returns an ISO date string in 'YYYY-MM-DD' format.
 * Gracefully handles invalid dates by returning the original string or empty string.
 *
 * @param baseDate ISO date string ('YYYY-MM-DD') or Date instance
 * @param days Number of days to subtract (can be negative to add days)
 * @returns Date string in 'YYYY-MM-DD' format
 */
export function subtractDays(baseDate: string | Date, days: number): string {
  const d = typeof baseDate === 'string'
    ? (baseDate.includes('T') ? new Date(baseDate) : new Date(baseDate + 'T00:00:00'))
    : new Date(baseDate);

  if (isNaN(d.getTime())) {
    return typeof baseDate === 'string' ? baseDate : '';
  }

  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the number of calendar days between a reference date (defaults to today) and a target date.
 * Positive number: days in the future.
 * 0: today.
 * Negative number: days in the past.
 * Returns null if the target date is empty or invalid.
 *
 * @param dateStr Target event date string ('YYYY-MM-DD')
 * @param referenceDate Optional reference Date object (defaults to current date at midnight)
 * @returns Number of calendar days or null if invalid
 */
export function getDaysUntilEvent(dateStr?: string | null, referenceDate?: Date): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const target = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
  if (isNaN(target.getTime())) return null;

  const ref = referenceDate ? new Date(referenceDate) : new Date();
  ref.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - ref.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats an event date string ('YYYY-MM-DD') into a human-readable localized string.
 * Safely returns the input string if the date cannot be parsed.
 *
 * @param dateStr Date string in 'YYYY-MM-DD' format
 * @param options Formatting options for Intl.DateTimeFormat
 * @param locale Optional locale string
 * @returns Formatted date string (e.g. 'Oct 31, 2026')
 */
export function formatEventDate(
  dateStr?: string | null,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
  locale?: string
): string {
  if (!dateStr) return '';
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(locale, options);
}

/**
 * Validates whether a given date string is a valid parseable date.
 *
 * @param dateStr Date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDateString(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}
