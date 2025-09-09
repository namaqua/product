/**
 * Date utility functions
 */

/**
 * Format a date to ISO string
 */
export function toISOString(date: Date | string | number): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return new Date(date).toISOString();
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: any): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Get the start of the day for a date
 */
export function startOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the day for a date
 */
export function endOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date | string, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date | string, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

/**
 * Get the difference between two dates in days
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  return new Date(date) < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string): boolean {
  return new Date(date) > new Date();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Format a date to a readable string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
): string {
  return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Format a date to a readable date and time string
 */
export function formatDateTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  return new Date(date).toLocaleString('en-US', options);
}

/**
 * Get a date range for filtering
 */
export interface DateRange {
  start: Date;
  end: Date;
}

export function getDateRange(
  period: 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom',
  customStart?: Date | string,
  customEnd?: Date | string,
): DateRange {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case 'today':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    
    case 'yesterday':
      const yesterday = addDays(now, -1);
      start = startOfDay(yesterday);
      end = endOfDay(yesterday);
      break;
    
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start = startOfDay(start);
      end = endOfDay(now);
      break;
    
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = endOfDay(now);
      break;
    
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      end = endOfDay(now);
      break;
    
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom date range requires start and end dates');
      }
      start = startOfDay(customStart);
      end = endOfDay(customEnd);
      break;
    
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  return { start, end };
}

/**
 * Parse a duration string (e.g., '1d', '2h', '30m') to milliseconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  
  if (!match) {
    throw new Error('Invalid duration format. Use format like "1d", "2h", "30m", "45s"');
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: throw new Error(`Invalid duration unit: ${unit}`);
  }
}
