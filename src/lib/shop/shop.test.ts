import { describe, it, expect } from 'vitest';
import getDiscountPercent from './getDiscountPercent';

describe('getDiscountPercent', () => {
  it('should calculate discount percentage correctly', () => {
    const price = {
      originalPrice: 100,
      currentPrice: 80,
      currency: 'TRY' as const,
    };
    expect(getDiscountPercent(price)).toBe(20);
  });

  it('should return 0 for no discount', () => {
    const price = {
      originalPrice: 100,
      currentPrice: 100,
      currency: 'TRY' as const,
    };
    // 0% discount but clamp returns min 1
    expect(getDiscountPercent(price)).toBe(1);
  });

  it('should clamp to maximum 100%', () => {
    const price = {
      originalPrice: 100,
      currentPrice: -50, // Edge case: negative price
      currency: 'TRY' as const,
    };
    expect(getDiscountPercent(price)).toBe(100);
  });

  it('should handle large discounts', () => {
    const price = {
      originalPrice: 1000,
      currentPrice: 100,
      currency: 'TRY' as const,
    };
    expect(getDiscountPercent(price)).toBe(90);
  });

  it('should floor decimal percentages', () => {
    const price = {
      originalPrice: 100,
      currentPrice: 67, // 33% discount
      currency: 'TRY' as const,
    };
    expect(getDiscountPercent(price)).toBe(33);
  });

  it('should handle small prices', () => {
    const price = {
      originalPrice: 10,
      currentPrice: 9,
      currency: 'TRY' as const,
    };
    expect(getDiscountPercent(price)).toBe(10);
  });
});
