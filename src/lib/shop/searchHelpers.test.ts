import { describe, it, expect } from 'vitest';
import {
  searchUrlFromOptions,
  mergeSearchOptions,
  removeSearchOptions,
} from './searchHelpers';

describe('searchUrlFromOptions', () => {
  it('should return base search URL for empty options', () => {
    const result = searchUrlFromOptions({});
    expect(result).toBe('/search?');
  });

  it('should include category in URL', () => {
    const result = searchUrlFromOptions({ category: 'makeup' });
    expect(result).toContain('category=makeup');
  });

  it('should include brand in URL', () => {
    const result = searchUrlFromOptions({ brand: 'loreal' });
    expect(result).toContain('brand=loreal');
  });

  it('should include query in URL', () => {
    const result = searchUrlFromOptions({ query: 'lipstick' });
    expect(result).toContain('query=lipstick');
  });

  it('should include sort in URL', () => {
    const result = searchUrlFromOptions({ sort: 'asc' });
    expect(result).toContain('sort=asc');
  });

  it('should include price in URL', () => {
    const result = searchUrlFromOptions({ price: '0-100' });
    expect(result).toContain('price=0-100');
  });

  it('should include color in URL', () => {
    const result = searchUrlFromOptions({ color: 'red' });
    expect(result).toContain('color=red');
  });

  it('should include collection in URL', () => {
    const result = searchUrlFromOptions({ collection: 'summer-2024' });
    expect(result).toContain('collection=summer-2024');
  });

  it('should include multiple options', () => {
    const result = searchUrlFromOptions({
      category: 'makeup',
      brand: 'loreal',
      sort: 'asc',
    });
    expect(result).toContain('category=makeup');
    expect(result).toContain('brand=loreal');
    expect(result).toContain('sort=asc');
  });

  it('should add salt when withSalt is true', () => {
    const result = searchUrlFromOptions({ category: 'test' }, true);
    expect(result).toContain('_=');
  });

  it('should not add salt when withSalt is false', () => {
    const result = searchUrlFromOptions({ category: 'test' }, false);
    expect(result).not.toContain('_=');
  });

  it('should include nt parameter when true', () => {
    const result = searchUrlFromOptions({ nt: 't' as any });
    expect(result).toContain('nt=t');
  });

  it('should include nf parameter when true', () => {
    const result = searchUrlFromOptions({ nf: 't' as any });
    expect(result).toContain('nf=t');
  });
});

describe('mergeSearchOptions', () => {
  it('should merge new options into existing options', () => {
    const current = { category: 'makeup' };
    const toMerge = { brand: 'loreal' };
    const result = mergeSearchOptions(current, toMerge);
    expect(result).toEqual({ category: 'makeup', brand: 'loreal' });
  });

  it('should merge comma-separated values', () => {
    const current = { brand: 'loreal' };
    const toMerge = { brand: 'maybelline' };
    const result = mergeSearchOptions(current, toMerge);
    expect(result.brand).toBe('loreal,maybelline');
  });

  it('should not duplicate existing values', () => {
    const current = { brand: 'loreal,maybelline' };
    const toMerge = { brand: 'loreal' };
    const result = mergeSearchOptions(current, toMerge);
    expect(result.brand).toBe('loreal,maybelline');
  });

  it('should handle empty current options', () => {
    const current = {};
    const toMerge = { brand: 'loreal' };
    const result = mergeSearchOptions(current, toMerge);
    expect(result).toEqual({ brand: 'loreal' });
  });

  it('should preserve other options when merging', () => {
    const current = { category: 'makeup', sort: 'asc' };
    const toMerge = { brand: 'loreal' };
    const result = mergeSearchOptions(current, toMerge);
    expect(result.category).toBe('makeup');
    expect(result.sort).toBe('asc');
    expect(result.brand).toBe('loreal');
  });
});

describe('removeSearchOptions', () => {
  it('should remove option value from comma-separated list', () => {
    const current = { brand: 'loreal,maybelline,revlon' };
    const toRemove = { brand: 'maybelline' };
    const result = removeSearchOptions(current, toRemove);
    expect(result.brand).toBe('loreal,revlon');
  });

  it('should return current options when no match found', () => {
    const current = { brand: 'loreal' };
    const toRemove = { brand: 'maybelline' };
    const result = removeSearchOptions(current, toRemove);
    expect(result.brand).toBe('loreal');
  });

  it('should return current options when key does not exist', () => {
    const current = { category: 'makeup' };
    const toRemove = { brand: 'loreal' };
    const result = removeSearchOptions(current, toRemove);
    expect(result).toEqual({ category: 'makeup' });
  });

  it('should preserve unrelated options when removing non-existing key', () => {
    const current = { sort: 'asc' };
    const toRemove = { brand: 'loreal' };
    const result = removeSearchOptions(current, toRemove);
    expect(result).toEqual({ sort: 'asc' });
  });

  it('should handle removing single value', () => {
    const current = { brand: 'loreal', category: 'makeup' };
    const toRemove = { brand: 'loreal' };
    const result = removeSearchOptions(current, toRemove);
    expect(result.brand).toBeUndefined();
    expect(result.category).toBe('makeup');
  });
});
