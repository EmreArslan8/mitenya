import { getSupabaseAnon } from '../supabase/anon';
import {  FILTER_CACHE_TTL, PRICE_RANGES } from '../constants/shop';

// Cache types
interface CategoryAggregation {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface BrandAggregation {
  id: string;
  name: string;
  slug: string;
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
  const [categoriesResult, brandsResult, productAggResult, priceResult] = await Promise.all([
    supabase.from('categories').select('id, name, slug'),
    supabase.from('brands').select('id, name, slug'),
    supabase.from('products').select('category_id, category_name, brand_id, brand_name'),
    supabase.from('product_prices').select('price_current'),
  ]);

  const categoryCountMap = (productAggResult.data ?? []).reduce<Record<string, number>>((acc, row) => {
    if (!row.category_id) return acc;
    acc[row.category_id] = (acc[row.category_id] ?? 0) + 1;
    return acc;
  }, {});

  const brandCountMap = (productAggResult.data ?? []).reduce<Record<string, number>>((acc, row) => {
    if (!row.brand_id) return acc;
    acc[row.brand_id] = (acc[row.brand_id] ?? 0) + 1;
    return acc;
  }, {});

  const categoryNameFallbackMap = (productAggResult.data ?? []).reduce<Record<string, string>>((acc, row) => {
    if (!row.category_id || !row.category_name || acc[row.category_id]) return acc;
    acc[row.category_id] = row.category_name;
    return acc;
  }, {});

  const brandNameFallbackMap = (productAggResult.data ?? []).reduce<Record<string, string>>((acc, row) => {
    if (!row.brand_id || !row.brand_name || acc[row.brand_id]) return acc;
    acc[row.brand_id] = row.brand_name;
    return acc;
  }, {});

  // Process categories (source of truth: categories table)
  const categories: CategoryAggregation[] = [];
  if (categoriesResult.data?.length) {
    categories.push(
      ...categoriesResult.data.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        count: categoryCountMap[row.id] ?? 0,
      }))
    );
  } else if (productAggResult.data) {
    const grouped = productAggResult.data.reduce<Record<string, CategoryAggregation>>(
      (acc, row) => {
        if (!acc[row.category_id]) {
          const fallbackName = row.category_name ?? row.category_id;
          acc[row.category_id] = {
            id: row.category_id,
            name: fallbackName,
            slug: fallbackName.toLowerCase().replace(/\s+/g, '-'),
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

  // Process brands (source of truth: brands table)
  const brands: BrandAggregation[] = [];
  if (brandsResult.data?.length) {
    brands.push(
      ...brandsResult.data.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        count: brandCountMap[row.id] ?? 0,
      }))
    );
  } else if (productAggResult.data) {
    const grouped = productAggResult.data.reduce<Record<string, BrandAggregation>>(
      (acc, row) => {
        if (!acc[row.brand_id]) {
          const fallbackName = row.brand_name ?? row.brand_id;
          acc[row.brand_id] = {
            id: row.brand_id,
            name: fallbackName,
            slug: fallbackName.toLowerCase().replace(/\s+/g, '-'),
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

  // Ensure names exist even if categories/brands table contains sparse values
  categories.forEach((category) => {
    if (!category.name) category.name = categoryNameFallbackMap[category.id] ?? category.id;
  });
  brands.forEach((brand) => {
    if (!brand.name) brand.name = brandNameFallbackMap[brand.id] ?? brand.id;
  });

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
