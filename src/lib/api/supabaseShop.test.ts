import { describe, expect, it } from 'vitest';
import { buildDynamicPriceFilters } from '../shop/priceFilters';

const getFiniteMax = (filters: ReturnType<typeof buildDynamicPriceFilters>) =>
  Math.max(
    ...filters
      .map((f) => {
        const token = f.searchOptions.price ?? '';
        const maxStr = token.split('-')[1];
        const parsed = maxStr ? Number(maxStr) : null;
        return Number.isFinite(parsed) ? (parsed as number) : Number.NEGATIVE_INFINITY;
      })
      .filter((n) => Number.isFinite(n))
  );

describe('buildDynamicPriceFilters', () => {
  it('returns empty list for empty price data', () => {
    expect(buildDynamicPriceFilters([])).toEqual([]);
  });

  it('keeps upper bound high enough for normal premium tail (no 1600 cap for 1800 product)', () => {
    const prices = [120, 180, 220, 310, 450, 590, 760, 920, 1100, 1400, 1600, 1800];
    const filters = buildDynamicPriceFilters(prices);
    expect(getFiniteMax(filters)).toBeGreaterThanOrEqual(1800);
  });

  it('reduces extreme outlier impact', () => {
    const prices = [120, 150, 180, 220, 260, 300, 360, 420, 500, 640, 800, 1000, 10000];
    const filters = buildDynamicPriceFilters(prices);
    const max = getFiniteMax(filters);
    expect(max).toBeLessThan(10000);
    expect(max).toBeGreaterThanOrEqual(1000);
  });

  it('ignores invalid selected token where min is greater than max', () => {
    const prices = [100, 250, 400, 600, 900];
    const filters = buildDynamicPriceFilters(prices, '1000-500');
    expect(filters.some((f) => f.selected)).toBe(false);
  });

  it('preserves selected custom range when it is not part of generated bins', () => {
    const prices = [100, 140, 180, 220, 260, 300, 340, 380];
    const filters = buildDynamicPriceFilters(prices, '5000-6000');
    const selected = filters.find((f) => f.selected);
    expect(selected).toBeDefined();
    expect(selected?.searchOptions.price).toBe('5000-6000');
    expect(selected?.count).toBe(0);
  });
});
