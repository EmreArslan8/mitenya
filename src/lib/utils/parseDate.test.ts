import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import parseDate from './parseDate';

describe('parseDate', () => {
  beforeEach(() => {
    // Mock Intl.DateTimeFormat for consistent test results
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({
        timeZone: 'UTC',
        locale: 'en-US',
      }),
      format: vi.fn(),
      formatToParts: vi.fn(),
      formatRange: vi.fn(),
      formatRangeToParts: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should parse date string in dd.mm.yyyy hh:mm format', () => {
    const result = parseDate('15.06.2024 14:30');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should handle single digit day and month', () => {
    const result = parseDate('01.01.2024 09:00');
    expect(result).toBeDefined();
  });

  it('should handle midnight', () => {
    const result = parseDate('31.12.2024 00:00');
    expect(result).toBeDefined();
  });

  it('should handle end of day', () => {
    const result = parseDate('31.12.2024 23:59');
    expect(result).toBeDefined();
  });

  it('should return formatted date string', () => {
    const result = parseDate('25.12.2024 12:00');
    // The result should be a non-empty string
    expect(result.length).toBeGreaterThan(0);
  });
});
