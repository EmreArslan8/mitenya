import type { SupabaseClient } from '@supabase/supabase-js';
import { getFilterAggregations } from '../cache/filterCache';
import { BRAND_PAGE_PRODUCT_LIMIT } from '../constants/shop';
import { mapShopProductRow, type ShopProductRow } from './shopProductMapper';
import type { ShopProductListItemData } from './types';

/**
 * Marka sayfası veri katmanı (ADR-0003).
 *
 * Stok çekilmez: marka sayfası stok göstermez, satın alma ürün detayında yapılır.
 * (Stok değişikliği webhook'u tetiklemediği için 1 saatlik cache'te bayat kalırdı.)
 *
 * Bilinçli olarak `fetchProductsSupabase` KULLANILMAZ: o fonksiyon facet ve
 * fiyat aralığı için birden çok paralel sorgu atar. Marka sayfası tek sorguyla
 * yetinir; marka kimliği ve ürün sayısı zaten `filterCache`'ten gelir.
 */

export type BrandSummary = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export type BrandProduct = ShopProductListItemData & {
  slug: string;
  benefits: string[];
};

type BrandProductRow = ShopProductRow & {
  product_benefits?: Array<{ benefits: { name_tr: string | null } | null }> | null;
};

const BRAND_PRODUCT_SELECT = `
  id,
  slug,
  name,
  brand_id,
  brand_name,
  category_name,
  current_price,
  original_price,
  currency,
  rating_average,
  rating_count,
  created_at,
  has_variants,
  product_prices!inner(price_current, price_original, currency),
  product_images(image_url, sort_order),
  product_benefits(benefits(name_tr))
`;

/** Tüm markalar — sitemap ve "diğer markalar" için. Sorgu atmaz (Redis/bellek cache). */
export const listBrands = async (): Promise<BrandSummary[]> => {
  const { brands } = await getFilterAggregations();
  return brands.map(({ id, name, slug, count }) => ({ id, name, slug, productCount: count }));
};

export const findBrandBySlug = async (slug: string): Promise<BrandSummary | null> =>
  (await listBrands()).find((brand) => brand.slug === slug) ?? null;

export const mapBrandProductRow = (row: BrandProductRow): BrandProduct => ({
  ...mapShopProductRow(row),
  slug: row.slug || row.id,
  benefits: (row.product_benefits ?? [])
    .map((link) => link.benefits?.name_tr)
    .filter((name): name is string => Boolean(name)),
});

/**
 * Bir markanın aktif ürünleri — tek sorgu.
 *
 * Hata durumunda boş dizi DÖNMEZ, fırlatır: sonuç `unstable_cache`'e girer ve boş
 * liste bir saat boyunca "ürün yok" diye servis edilirdi. Fırlatınca Next eski
 * (bayat ama doğru) sayfayı servis etmeye devam eder.
 */
export const fetchBrandProducts = async (
  supabase: SupabaseClient,
  brandId: string,
  limit: number = BRAND_PAGE_PRODUCT_LIMIT
): Promise<BrandProduct[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(BRAND_PRODUCT_SELECT)
    .eq('brand_id', brandId)
    .eq('status', 'active')
    .order('rating_count', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`fetchBrandProducts(${brandId}) failed: ${error.message}`);
  }

  return ((data ?? []) as unknown as BrandProductRow[]).map(mapBrandProductRow);
};
