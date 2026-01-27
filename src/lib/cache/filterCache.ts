import { getSupabaseAnon } from '../supabase/anon';
import {  FILTER_CACHE_TTL, PRICE_RANGES } from '../constants/shop';

// Cache types
interface CategoryAggregation {
  id: string;
  name: string;
  count: number;
}

interface BrandAggregation {
  id: string;
  name: string;
  count: number;
}

interface PriceRange {
  label: string;
  min: number;
  max: number;
  count: number;
}

interface FilterCache {
  categories: CategoryAggregation[];
  brands: BrandAggregation[];
  priceRanges: PriceRange[];
  lastUpdated: number;
}

// In-memory cache
let filterCache: FilterCache | null = null;

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  if (!filterCache) return false;
  return Date.now() - filterCache.lastUpdated < FILTER_CACHE_TTL;
}

/**
 * Fetch and cache filter aggregations
 * Runs all aggregation queries in parallel for better performance
 */
async function refreshFilterCache(): Promise<FilterCache> {
  const supabase = getSupabaseAnon();

  // Run all queries in parallel
  const [categoryResult, brandResult, priceResult] = await Promise.all([
    supabase.from('products').select('category_id, category_name'),
    supabase.from('products').select('brand_id, brand_name'),
    supabase.from('product_prices').select('price_current'),
  ]);

  // Process categories
  const categories: CategoryAggregation[] = [];
  if (categoryResult.data) {
    const grouped = categoryResult.data.reduce<Record<string, CategoryAggregation>>(
      (acc, row) => {
        if (!acc[row.category_id]) {
          acc[row.category_id] = {
            id: row.category_id,
            name: row.category_name,
            count: 0,
          };
        }
        acc[row.category_id].count += 1;
        return acc;
      },
      {}
    );
    categories.push(...Object.values(grouped));
  }

  // Process brands
  const brands: BrandAggregation[] = [];
  if (brandResult.data) {
    const grouped = brandResult.data.reduce<Record<string, BrandAggregation>>(
      (acc, row) => {
        if (!acc[row.brand_id]) {
          acc[row.brand_id] = {
            id: row.brand_id,
            name: row.brand_name,
            count: 0,
          };
        }
        acc[row.brand_id].count += 1;
        return acc;
      },
      {}
    );
    brands.push(...Object.values(grouped));
  }

  // Process price ranges
  const priceRanges: PriceRange[] = [];
  if (priceResult.data) {
    const prices = priceResult.data.map((p) => Number(p.price_current));

    for (const range of PRICE_RANGES) {
      const count = prices.filter((p) => p >= range.min && p < range.max).length;
      priceRanges.push({
        label: range.label,
        min: range.min,
        max: range.max,
        count,
      });
    }
  }

  // Update cache
  filterCache = {
    categories,
    brands,
    priceRanges,
    lastUpdated: Date.now(),
  };

  return filterCache;
}

/**
 * Get filter aggregations (from cache or fresh)
 */
export async function getFilterAggregations(): Promise<FilterCache> {
  if (isCacheValid() && filterCache) {
    return filterCache;
  }

  return refreshFilterCache();
}

/**
 * Force refresh cache (useful after product updates)
 */
export async function invalidateFilterCache(): Promise<void> {
  filterCache = null;
}

/**
 * Get cache status (for debugging)
 */
export function getCacheStatus(): { valid: boolean; age: number | null } {
  if (!filterCache) {
    return { valid: false, age: null };
  }

  const age = Date.now() - filterCache.lastUpdated;
  return {
    valid: age < FILTER_CACHE_TTL,
    age,
  };
}

export { PRICE_RANGES };
export type { CategoryAggregation, BrandAggregation, PriceRange, FilterCache };
