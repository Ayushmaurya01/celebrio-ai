import { describe, it, expect } from 'vitest';
import { 
  subtractDays, 
  getDaysUntilEvent, 
  formatEventDate, 
  isValidDateString 
} from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('subtractDays', () => {
    it('subtracts days accurately within the same month', () => {
      expect(subtractDays('2026-06-25', 5)).toBe('2026-06-20');
      expect(subtractDays('2026-06-25', 20)).toBe('2026-06-05');
    });

    it('handles month boundaries correctly', () => {
      expect(subtractDays('2026-05-03', 5)).toBe('2026-04-28');
      expect(subtractDays('2026-03-02', 2)).toBe('2026-02-28');
    });

    it('handles year boundaries correctly', () => {
      expect(subtractDays('2026-01-05', 10)).toBe('2025-12-26');
    });

    it('handles leap years accurately', () => {
      expect(subtractDays('2028-03-01', 1)).toBe('2028-02-29');
    });

    it('accepts a Date object as input', () => {
      const date = new Date(2026, 9, 31); // 2026-10-31 local
      const result = subtractDays(date, 10);
      expect(result).toBe('2026-10-21');
    });

    it('adds days when a negative number is supplied', () => {
      expect(subtractDays('2026-06-20', -5)).toBe('2026-06-25');
    });

    it('handles 0 days subtracted', () => {
      expect(subtractDays('2026-10-31', 0)).toBe('2026-10-31');
    });

    it('gracefully handles invalid date strings by returning the input string', () => {
      expect(subtractDays('invalid-date', 10)).toBe('invalid-date');
      expect(subtractDays('', 5)).toBe('');
    });
  });

  describe('getDaysUntilEvent', () => {
    it('returns positive days for future dates', () => {
      const today = new Date('2026-10-01T00:00:00');
      expect(getDaysUntilEvent('2026-10-15', today)).toBe(14);
      expect(getDaysUntilEvent('2026-10-02', today)).toBe(1);
    });

    it('returns 0 for the exact event day', () => {
      const today = new Date('2026-10-15T08:30:00');
      expect(getDaysUntilEvent('2026-10-15', today)).toBe(0);
    });

    it('returns negative days for past events', () => {
      const today = new Date('2026-10-20T00:00:00');
      expect(getDaysUntilEvent('2026-10-10', today)).toBe(-10);
    });

    it('handles ISO timestamps with time information', () => {
      const today = new Date('2026-10-01T00:00:00');
      expect(getDaysUntilEvent('2026-10-11T18:00:00', today)).toBe(10);
    });

    it('returns null for null, undefined, or empty date strings', () => {
      expect(getDaysUntilEvent(null)).toBeNull();
      expect(getDaysUntilEvent(undefined)).toBeNull();
      expect(getDaysUntilEvent('')).toBeNull();
    });

    it('returns null for unparseable date strings', () => {
      expect(getDaysUntilEvent('gibberish-not-a-date')).toBeNull();
    });
  });

  describe('formatEventDate', () => {
    it('formats a standard date string to readable format', () => {
      const formatted = formatEventDate('2026-12-25', { month: 'short', day: 'numeric', year: 'numeric' }, 'en-US');
      expect(formatted).toBe('Dec 25, 2026');
    });

    it('supports custom formatting options like weekday and long month', () => {
      const formatted = formatEventDate('2026-10-31', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, 'en-US');
      expect(formatted).toContain('Saturday');
      expect(formatted).toContain('October');
      expect(formatted).toContain('31');
      expect(formatted).toContain('2026');
    });

    it('returns the input string if date is invalid', () => {
      expect(formatEventDate('invalid-date')).toBe('invalid-date');
    });

    it('returns empty string if input is null or undefined', () => {
      expect(formatEventDate(null)).toBe('');
      expect(formatEventDate(undefined)).toBe('');
    });
  });

  describe('isValidDateString', () => {
    it('returns true for valid YYYY-MM-DD date strings', () => {
      expect(isValidDateString('2026-10-31')).toBe(true);
      expect(isValidDateString('2027-01-01')).toBe(true);
    });

    it('returns true for valid ISO datetime strings', () => {
      expect(isValidDateString('2026-10-31T14:30:00.000Z')).toBe(true);
    });

    it('returns false for invalid date strings', () => {
      expect(isValidDateString('not-a-date')).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString(null)).toBe(false);
      expect(isValidDateString(undefined)).toBe(false);
    });
  });
});
