import { fetchProductsSupabase } from './supabaseShop';
import { fetchProductDataSupabase } from './supabaseProducts';
import {
  ShopProductData,
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponse,
} from './types';
import { supabaseAdmin } from '../supabase/admin';

// ============================================================
// 🛍️ PRODUCTS
// ============================================================

export const fetchProducts = async (
  options: Partial<ShopSearchOptions>
): Promise<ShopSearchResponse | undefined> => {
  try {
    return await fetchProductsSupabase(options);
  } catch (error) {
    console.error('Fetch products error:', error);
    return undefined;
  }
};

export const fetchProductData = async (id: string): Promise<ShopProductData | undefined> => {
  try {
    return (await fetchProductDataSupabase(id)) ?? undefined;
  } catch (error) {
    console.error('Fetch product error:', error);
    return undefined;
  }
};

export async function fetchProductVariants(productId: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('attributes_json')
    .eq('id', productId)
    .single();

  if (error || !data) return null;

  try {
    return typeof data.attributes_json === 'string'
      ? JSON.parse(data.attributes_json)
      : data.attributes_json;
  } catch {
    return [];
  }
}

// ============================================================
// 🎯 RECOMMENDATIONS
// ============================================================

export const fetchRecommendations = async (options: {
  brandId: string;
  productId: string;
}): Promise<ShopProductListItemData[]> => {
  try {
    // TODO: Supabase'e taşınabilir
    const { data } = await supabaseAdmin
      .from('products')
      .select(
        `
        id, slug, name, brand_id, brand_name,
        current_price, original_price, currency, main_image_url
      `
      )
      .eq('brand_id', options.brandId)
      .neq('id', options.productId)
      .limit(8);

    return (data || []).map((p) => ({
      id: p.id,
      brand: p.brand_name || '',
      brandId: p.brand_id || '',
      name: p.name,
      url: `/product/${p.slug || p.id}`,
      imgSrc: p.main_image_url || '',
      price: {
        currentPrice: Number(p.current_price) || 0,
        originalPrice: Number(p.original_price) || Number(p.current_price) || 0,
        currency: p.currency || 'TRY',
      },
    }));
  } catch (error) {
    console.error('Fetch recommendations error:', error);
    return [];
  }
};

// ============================================================
// 📦 ORDERS - Server Component'larda kullanım için:
// import { fetchOrdersSupabase, fetchOrderSupabase } from '@/lib/api/supabaseOrders';
// ============================================================
