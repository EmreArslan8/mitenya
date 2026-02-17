import { describe, it, expect, vi, beforeEach } from 'vitest';
import capitalize from './capitalize';
import clamp from './clamp';
import truncateFilename from './truncate';
import formatPrice from './formatPrice';
import formatFileSize from './formatFileSize';
import isValidUrl from './isValidUrl';
import tokenize from './tokenize';
import getCurrencySymbol, { currencyCodes, getDisplayCurrencyCode } from './currencies';
import {
  countries,
  originCountries,
  destinationCountries,
  getCustomsLimitForCountry,
  getCurrencyForCountry,
} from './countries';

// ============================================================
// CAPITALIZE
// ============================================================
describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle undefined', () => {
    expect(capitalize(undefined)).toBe('');
  });

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('should keep rest of string as is', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
  });

  it('should handle string with spaces', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });
});

// ============================================================
// CLAMP
// ============================================================
describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(0, 5, 10)).toBe(5);
  });

  it('should return min when value is below min', () => {
    expect(clamp(0, -5, 10)).toBe(0);
  });

  it('should return max when value is above max', () => {
    expect(clamp(0, 15, 10)).toBe(10);
  });

  it('should return min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('should return max when value equals max', () => {
    expect(clamp(0, 10, 10)).toBe(10);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-10, -5, -1)).toBe(-5);
  });

  it('should handle decimal values', () => {
    expect(clamp(0.5, 0.7, 1.0)).toBe(0.7);
  });
});

// ============================================================
// TRUNCATE FILENAME
// ============================================================
describe('truncateFilename', () => {
  it('should not truncate short filenames', () => {
    expect(truncateFilename('file.txt', 20)).toBe('file.txt');
  });

  it('should truncate long filenames', () => {
    const result = truncateFilename('very-long-filename-here.pdf', 15);
    expect(result).toContain('...');
    expect(result.length).toBeLessThanOrEqual(15);
  });

  it('should handle exact length', () => {
    expect(truncateFilename('12345', 5)).toBe('12345');
  });

  it('should preserve start and end', () => {
    const result = truncateFilename('abcdefghij', 8);
    expect(result).toContain('...');
    expect(result.startsWith('ab')).toBe(true);
    expect(result.endsWith('ij')).toBe(true);
  });
});

// ============================================================
// FORMAT PRICE
// ============================================================
describe('formatPrice', () => {
  it('should format TRY price correctly', () => {
    const result = formatPrice(100);
    expect(result).toContain('100');
    expect(result).toContain('₺');
  });

  it('should format with custom currency', () => {
    const result = formatPrice(100, 'USD', 'en-US');
    expect(result).toContain('$');
    expect(result).toContain('100');
  });

  it('should handle decimal values', () => {
    const result = formatPrice(99.99);
    expect(result).toContain('99');
  });

  it('should handle zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  it('should use fallback for invalid currency', () => {
    const result = formatPrice(100, 'INVALID');
    expect(result).toContain('100');
  });
});

// ============================================================
// FORMAT FILE SIZE
// ============================================================
describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    const result = formatFileSize(2048);
    expect(result).toBe('2.00 KB');
  });

  it('should format megabytes', () => {
    const result = formatFileSize(1048576);
    expect(result).toBe('1.00 MB');
  });

  it('should handle zero', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('should format decimal KB correctly', () => {
    const result = formatFileSize(1536); // 1.5 KB
    expect(result).toBe('1.50 KB');
  });

  it('should format decimal MB correctly', () => {
    const result = formatFileSize(1572864); // 1.5 MB
    expect(result).toBe('1.50 MB');
  });
});

// ============================================================
// IS VALID URL
// ============================================================
describe('isValidUrl', () => {
  it('should return true for valid http URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('should return true for valid https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('should return true for URL with path', () => {
    expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
  });

  it('should return true for URL with query params', () => {
    expect(isValidUrl('https://example.com?foo=bar')).toBe(true);
  });

  it('should return false for invalid URL', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidUrl(undefined)).toBe(false);
  });

  it('should return false for relative path', () => {
    expect(isValidUrl('/path/to/page')).toBe(false);
  });
});

// ============================================================
// TOKENIZE
// ============================================================
describe('tokenize', () => {
  it('should split string into tokens', () => {
    expect(tokenize('abcdef', 2)).toEqual(['ab', 'cd', 'ef']);
  });

  it('should handle uneven split', () => {
    expect(tokenize('abcde', 2)).toEqual(['ab', 'cd', 'e']);
  });

  it('should handle single token', () => {
    expect(tokenize('abc', 10)).toEqual(['abc']);
  });

  it('should handle empty string', () => {
    expect(tokenize('', 5)).toEqual([]);
  });

  it('should handle single character tokens', () => {
    expect(tokenize('abc', 1)).toEqual(['a', 'b', 'c']);
  });
});

// ============================================================
// CURRENCY SYMBOL
// ============================================================
describe('getCurrencySymbol', () => {
  it('should return $ for USD', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
  });

  it('should return € for EUR', () => {
    expect(getCurrencySymbol('EUR')).toBe('€');
  });

  it('should return ₺ for TRY', () => {
    expect(getCurrencySymbol('TRY')).toBe('₺');
  });

  it('should handle lowercase input', () => {
    expect(getCurrencySymbol('usd')).toBe('$');
  });

  it('should return code for unknown currency', () => {
    expect(getCurrencySymbol('XYZ')).toBe('XYZ');
  });
});

describe('currencyCodes', () => {
  it('should contain USD, EUR, TRY', () => {
    expect(currencyCodes).toContain('USD');
    expect(currencyCodes).toContain('EUR');
    expect(currencyCodes).toContain('TRY');
  });
});

describe('getDisplayCurrencyCode', () => {
  it('should return TL for TRY', () => {
    expect(getDisplayCurrencyCode('TRY')).toBe('TL');
  });

  it('should handle lowercase TRY', () => {
    expect(getDisplayCurrencyCode('try')).toBe('TL');
  });

  it('should return uppercase code for non-TRY currencies', () => {
    expect(getDisplayCurrencyCode('usd')).toBe('USD');
  });
});

// ============================================================
// COUNTRIES
// ============================================================
describe('countries', () => {
  it('should have defined country lists', () => {
    expect(countries.length).toBeGreaterThan(0);
    expect(originCountries.length).toBeGreaterThan(0);
    expect(destinationCountries.length).toBeGreaterThan(0);
  });

  it('should contain TR in countries', () => {
    expect(countries).toContain('TR');
  });

  it('should contain TR in origin countries', () => {
    expect(originCountries).toContain('TR');
  });
});

describe('getCustomsLimitForCountry', () => {
  it('should return limit for TR', () => {
    const limit = getCustomsLimitForCountry('TR');
    expect(limit.amount).toBe(150);
    expect(limit.currency).toBe('TRY');
  });

  it('should return limit for EU', () => {
    const limit = getCustomsLimitForCountry('EU');
    expect(limit.amount).toBe(150);
    expect(limit.currency).toBe('EUR');
  });

  it('should return limit for GB', () => {
    const limit = getCustomsLimitForCountry('GB');
    expect(limit.amount).toBe(150);
    expect(limit.currency).toBe('EUR');
  });
});

describe('getCurrencyForCountry', () => {
  it('should return TRY for TR', () => {
    expect(getCurrencyForCountry('TR')).toBe('TRY');
  });

  it('should return EUR for EU countries', () => {
    expect(getCurrencyForCountry('BE')).toBe('EUR');
    expect(getCurrencyForCountry('DE')).toBe('EUR');
    expect(getCurrencyForCountry('NL')).toBe('EUR');
    expect(getCurrencyForCountry('GB')).toBe('EUR');
  });

  it('should return USD for US', () => {
    expect(getCurrencyForCountry('US')).toBe('USD');
  });

  it('should return USD for undefined', () => {
    expect(getCurrencyForCountry(undefined)).toBe('USD');
  });

  it('should return USD for ww (worldwide)', () => {
    expect(getCurrencyForCountry('ww')).toBe('USD');
  });
});
