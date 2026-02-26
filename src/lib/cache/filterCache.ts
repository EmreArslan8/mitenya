import { getSupabaseAnon } from '../supabase/anon';
import {  FILTER_CACHE_TTL, PRICE_RANGES } from '../constants/shop';
import { isUpstashEnabled, parseUpstashResult, runUpstashPipeline } from './upstashRedis';

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

interface ConcernAggregation {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface BenefitAggregation {
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
  benefits: BenefitAggregation[];
  concerns: ConcernAggregation[];
  priceRanges: PriceRange[];
  lastUpdated: number;
}

// In-memory cache
let filterCache: FilterCache | null = null;
const FILTER_CACHE_REDIS_KEY = 'shop:filter-aggregations:v2';

function parseFilterCache(raw: unknown): FilterCache | null {
  if (typeof raw !== 'string') return null;

  try {
    const parsed = JSON.parse(raw) as FilterCache;
    if (!parsed || typeof parsed.lastUpdated !== 'number') return null;
    if (
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.brands) ||
      !Array.isArray(parsed.priceRanges)
    ) {
      return null;
    }
    if (!Array.isArray((parsed as any).benefits)) (parsed as any).benefits = [];
    if (!Array.isArray((parsed as any).concerns)) (parsed as any).concerns = [];
    return parsed;
  } catch {
    return null;
  }
}

async function getFilterCacheFromRedis(): Promise<FilterCache | null> {
  if (!isUpstashEnabled()) return null;

  try {
    const result = await runUpstashPipeline([['GET', FILTER_CACHE_REDIS_KEY]]);
    const raw = parseUpstashResult(result[0]);
    return parseFilterCache(raw);
  } catch (err) {
    console.error('FilterCache Redis read fallback:', err);
    return null;
  }
}

async function setFilterCacheToRedis(cache: FilterCache): Promise<void> {
  if (!isUpstashEnabled()) return;

  try {
    await runUpstashPipeline([
      ['SET', FILTER_CACHE_REDIS_KEY, JSON.stringify(cache), 'PX', FILTER_CACHE_TTL],
    ]);
  } catch (err) {
    console.error('FilterCache Redis write fallback:', err);
  }
}

async function deleteFilterCacheFromRedis(): Promise<void> {
  if (!isUpstashEnabled()) return;

  try {
    await runUpstashPipeline([['DEL', FILTER_CACHE_REDIS_KEY]]);
  } catch (err) {
    console.error('FilterCache Redis delete fallback:', err);
  }
}

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
  const [
    categoriesResult,
    brandsResult,
    productAggResult,
    concernsResult,
    productConcernsResult,
    benefitsResult,
    productBenefitsResult,
  ] = await Promise.all([
    supabase.from('categories').select('id, name, slug'),
    supabase.from('brands').select('id, name, slug'),
    supabase.from('products').select('id, category_id, category_name, brand_id, brand_name, current_price'),
    supabase.from('concerns').select('id, name_tr, slug, is_active, sort_order'),
    supabase.from('product_concerns').select('product_id, concern_id'),
    supabase.from('benefits').select('id, name_tr, slug, is_active, sort_order'),
    supabase.from('product_benefits').select('product_id, benefit_id'),
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

  const concernCountMap = (productConcernsResult.data ?? []).reduce<Record<string, Set<string>>>((acc, row) => {
    if (!row.concern_id || !row.product_id) return acc;
    if (!acc[row.concern_id]) acc[row.concern_id] = new Set<string>();
    acc[row.concern_id].add(String(row.product_id));
    return acc;
  }, {});

  const concerns: ConcernAggregation[] = (concernsResult.data ?? [])
    .filter((row) => row.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((row) => ({
      id: row.id,
      name: row.name_tr || row.slug,
      slug: row.slug,
      count: concernCountMap[row.id]?.size ?? 0,
    }));

  const benefitCountMap = (productBenefitsResult.data ?? []).reduce<Record<string, Set<string>>>((acc, row) => {
    if (!row.benefit_id || !row.product_id) return acc;
    if (!acc[row.benefit_id]) acc[row.benefit_id] = new Set<string>();
    acc[row.benefit_id].add(String(row.product_id));
    return acc;
  }, {});

  const benefits: BenefitAggregation[] = (benefitsResult.data ?? [])
    .filter((row) => row.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((row) => ({
      id: row.id,
      name: row.name_tr || row.slug,
      slug: row.slug,
      count: benefitCountMap[row.id]?.size ?? 0,
    }));

  // Process price ranges
  const prices = (productAggResult.data ?? [])
    .map((p) => Number(p.current_price))
    .filter((p) => Number.isFinite(p));

  const priceRanges: PriceRange[] = PRICE_RANGES.map((range) => ({
    label: range.label,
    min: range.min,
    max: range.max,
    count: prices.filter((p) => p >= range.min && p < range.max).length,
  }));

  filterCache = {
    categories,
    brands,
    benefits,
    concerns,
    priceRanges,
    lastUpdated: Date.now(),
  };
  await setFilterCacheToRedis(filterCache);

  return filterCache;
}

/**
 * Get filter aggregations (from cache or fresh)
 */
export async function getFilterAggregations(): Promise<FilterCache> {
  if (isCacheValid() && filterCache) {
    return filterCache;
  }

  const redisCache = await getFilterCacheFromRedis();
  if (redisCache && Date.now() - redisCache.lastUpdated < FILTER_CACHE_TTL) {
    filterCache = redisCache;
    return redisCache;
  }

  return refreshFilterCache();
}

/**
 * Force refresh cache (useful after product updates)
 */
export async function invalidateFilterCache(): Promise<void> {
  filterCache = null;
  await deleteFilterCacheFromRedis();
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
export type { CategoryAggregation, BrandAggregation, ConcernAggregation, BenefitAggregation, PriceRange, FilterCache };
