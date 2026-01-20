import { describe, it, expect } from 'vitest';
import { groupCategories, formatPrice } from './helpers';

describe('groupCategories', () => {
  it('should group categories by parent', () => {
    const categories = [
      { _id: 'cat-1', name: 'Parent 1', parent: null },
      { _id: 'cat-2', name: 'Parent 2', parent: null },
      { _id: 'cat-3', name: 'Child 1', parent: { _ref: 'cat-1' } },
      { _id: 'cat-4', name: 'Child 2', parent: { _ref: 'cat-1' } },
      { _id: 'cat-5', name: 'Child 3', parent: { _ref: 'cat-2' } },
    ];

    const result = groupCategories(categories as any);

    expect(result).toHaveLength(2);
    expect(result[0].children).toHaveLength(2);
    expect(result[1].children).toHaveLength(1);
  });

  it('should return empty children for categories without children', () => {
    const categories = [
      { _id: 'cat-1', name: 'Parent 1', parent: null },
      { _id: 'cat-2', name: 'Parent 2', parent: null },
    ];

    const result = groupCategories(categories as any);

    expect(result).toHaveLength(2);
    expect(result[0].children).toHaveLength(0);
    expect(result[1].children).toHaveLength(0);
  });

  it('should handle empty array', () => {
    const result = groupCategories([]);
    expect(result).toEqual([]);
  });

  it('should handle only child categories', () => {
    const categories = [
      { _id: 'cat-1', name: 'Child 1', parent: { _ref: 'non-existent' } },
    ];

    const result = groupCategories(categories as any);
    expect(result).toHaveLength(0);
  });
});

describe('formatPrice (helpers)', () => {
  it('should format TRY price with symbol', () => {
    const result = formatPrice(10000); // 100.00 TRY
    expect(result).toContain('₺');
    expect(result).toContain('100');
  });

  it('should format with custom currency', () => {
    const result = formatPrice(10000, 'USD');
    expect(result).toContain('100.00');
    expect(result).toContain('USD');
  });

  it('should handle zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  it('should handle cents correctly', () => {
    const result = formatPrice(9999); // 99.99
    expect(result).toContain('99');
  });

  it('should format decimal values for TRY', () => {
    const result = formatPrice(12345); // 123.45
    expect(result).toContain('123');
  });
});
