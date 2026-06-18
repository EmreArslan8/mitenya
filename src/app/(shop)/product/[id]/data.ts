import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

/**
 * ADR-0001: supabase-js sorgusu Next data cache'ine girmiyor (cache ipucu vermez),
 * bu da route'u dynamic'e zorluyordu. unstable_cache ile sonucu cache'liyoruz:
 *  - ISR açılır (TTFB cache'ten),
 *  - `product:<slug>` tag'i ile ürün güncellenince webhook → revalidateTag ile
 *    ANINDA tazeleme mümkün (Faz B). revalidate=300 altta güvenlik ağı.
 */
export const productCacheTag = (idOrSlug: string) => `product:${idOrSlug}`;

const getCachedProductData = (idOrSlug: string) =>
  unstable_cache(
    () => fetchProductDataSupabase(idOrSlug),
    ['product-data', idOrSlug],
    { revalidate: 300, tags: [productCacheTag(idOrSlug)] }
  )();

// React cache(): aynı render içinde generateMetadata + sayfa çağrılarını dedup eder.
export const getProductData = cache(getCachedProductData);
