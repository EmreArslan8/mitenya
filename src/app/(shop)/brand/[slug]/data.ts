import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { fetchBrandContent, type BrandContent } from '@/lib/api/cmsBrand';
import {
  fetchBrandProducts,
  findBrandBySlug,
  listBrands,
  type BrandProduct,
  type BrandSummary,
} from '@/lib/api/supabaseBrand';
import { getSupabaseAnon } from '@/lib/supabase/anon';
import { brandTag } from '@/lib/cache/tags';
import { isBrandIndexable } from '@/lib/seo/brandIndexing';

/** ISR güvenlik ağı; asıl tazelik webhook → revalidateTag (ADR-0003). page.tsx ile aynı olmalı. */
export const BRAND_REVALIDATE_SECONDS = 3600;

export type BrandPageData = {
  brand: BrandSummary;
  products: BrandProduct[];
  content: BrandContent | null;
  otherBrands: BrandSummary[];
  /** Strapi içeriği girilmeden sayfa indekslenmez (ince içerik). */
  indexable: boolean;
};

const getCachedBrandProducts = (brandId: string) =>
  unstable_cache(
    () => fetchBrandProducts(getSupabaseAnon(), brandId),
    ['brand-products', brandId],
    { revalidate: BRAND_REVALIDATE_SECONDS, tags: [brandTag(brandId)] }
  )();

const loadBrandPageData = async (slug: string): Promise<BrandPageData | null> => {
  const brand = await findBrandBySlug(slug);
  if (!brand) return null;

  const [products, content, brands] = await Promise.all([
    getCachedBrandProducts(brand.id),
    fetchBrandContent(slug),
    listBrands(),
  ]);

  return {
    brand,
    products,
    content,
    otherBrands: brands.filter((other) => other.id !== brand.id && other.productCount > 0),
    indexable: isBrandIndexable({ hasContent: Boolean(content), productCount: products.length }),
  };
};

// React cache(): generateMetadata ve sayfa aynı render'da tek yükleme yapar.
export const getBrandPageData = cache(loadBrandPageData);
