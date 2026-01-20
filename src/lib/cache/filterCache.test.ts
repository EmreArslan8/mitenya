import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getFilterAggregations,
  invalidateFilterCache,
  getCacheStatus,
} from './filterCache';

// Mock Supabase
vi.mock('../supabase/anon', () => ({
  getSupabaseAnon: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        data: getMockDataForTable(table),
        error: null,
      })),
    })),
  })),
}));

function getMockDataForTable(table: string) {
  switch (table) {
    case 'products':
      return [
        { category_id: 'cat-1', category_name: 'Makyaj', brand_id: 'brand-1', brand_name: 'Maybelline' },
        { category_id: 'cat-1', category_name: 'Makyaj', brand_id: 'brand-2', brand_name: 'Loreal' },
        { category_id: 'cat-2', category_name: 'Cilt Bakımı', brand_id: 'brand-1', brand_name: 'Maybelline' },
      ];
    case 'product_prices':
      return [
        { price_current: 100 },
        { price_current: 300 },
        { price_current: 600 },
        { price_current: 1200 },
      ];
    default:
      return [];
  }
}

describe('filterCache', () => {
  beforeEach(() => {
    // Clear cache before each test
    invalidateFilterCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCacheStatus', () => {
    it('should return invalid when cache is empty', () => {
      const status = getCacheStatus();
      expect(status.valid).toBe(false);
      expect(status.age).toBeNull();
    });

    it('should return valid after fetching aggregations', async () => {
      await getFilterAggregations();
      const status = getCacheStatus();
      expect(status.valid).toBe(true);
      expect(status.age).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getFilterAggregations', () => {
    it('should return category aggregations', async () => {
      const result = await getFilterAggregations();

      expect(result.categories).toBeDefined();
      expect(result.categories.length).toBeGreaterThan(0);

      // Check category structure
      const makyaj = result.categories.find((c) => c.name === 'Makyaj');
      expect(makyaj).toBeDefined();
      expect(makyaj?.count).toBe(2);
    });

    it('should return brand aggregations', async () => {
      const result = await getFilterAggregations();

      expect(result.brands).toBeDefined();
      expect(result.brands.length).toBeGreaterThan(0);

      // Check brand structure
      const maybelline = result.brands.find((b) => b.name === 'Maybelline');
      expect(maybelline).toBeDefined();
      expect(maybelline?.count).toBe(2);
    });

    it('should return price range aggregations', async () => {
      const result = await getFilterAggregations();

      expect(result.priceRanges).toBeDefined();
      expect(result.priceRanges.length).toBe(5); // 5 price ranges defined

      // Check first range (0-250)
      const firstRange = result.priceRanges[0];
      expect(firstRange.min).toBe(0);
      expect(firstRange.max).toBe(250);
      expect(firstRange.count).toBe(1); // Only 100 TL product
    });

    it('should use cached data on subsequent calls', async () => {
      const result1 = await getFilterAggregations();
      const result2 = await getFilterAggregations();

      // Should be same reference (from cache)
      expect(result1).toBe(result2);
    });
  });

  describe('invalidateFilterCache', () => {
    it('should clear the cache', async () => {
      // Fill cache
      await getFilterAggregations();
      expect(getCacheStatus().valid).toBe(true);

      // Invalidate
      invalidateFilterCache();
      expect(getCacheStatus().valid).toBe(false);
    });
  });
});

describe('Price Range Calculation', () => {
  beforeEach(() => {
    invalidateFilterCache();
  });

  it('should correctly count products in each price range', async () => {
    const result = await getFilterAggregations();

    // Mock data: 100, 300, 600, 1200
    // Range 0-250: 1 (100)
    // Range 250-500: 1 (300)
    // Range 500-750: 1 (600)
    // Range 750-1000: 0
    // Range 1000+: 1 (1200)

    expect(result.priceRanges[0].count).toBe(1); // 0-250
    expect(result.priceRanges[1].count).toBe(1); // 250-500
    expect(result.priceRanges[2].count).toBe(1); // 500-750
    expect(result.priceRanges[3].count).toBe(0); // 750-1000
    expect(result.priceRanges[4].count).toBe(1); // 1000+
  });
});
