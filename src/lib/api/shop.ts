import {
  ShopProductData,
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponse,
} from './types';

// ============================================================
// 🛍️ PRODUCTS - Client-safe (API route üzerinden)
// ============================================================

export const fetchProducts = async (
  options: Partial<ShopSearchOptions>
): Promise<ShopSearchResponse | undefined> => {
  try {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.sort) params.set('sort', options.sort);
    if (options.brand) params.set('brand', options.brand);
    if (options.category) params.set('category', options.category);
    if (options.query) params.set('query', options.query);
    if (options.price) params.set('price', options.price);

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (error) {
    console.error('Fetch products error:', error);
    return undefined;
  }
};

export const fetchProductData = async (id: string): Promise<ShopProductData | undefined> => {
  try {
    const res = await fetch(`/api/products/${id}/detail`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch (error) {
    console.error('Fetch product error:', error);
    return undefined;
  }
};

export async function fetchProductVariants(productId: string) {
  try {
    const res = await fetch(`/api/products/${productId}/variants`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Fetch variants error:', error);
    return null;
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
    const res = await fetch(
      `/api/products/${options.productId}/recommendations?brandId=${options.brandId}`
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Fetch recommendations error:', error);
    return [];
  }
};

// ============================================================
// 📦 ORDERS - Server Component'larda kullanım için:
// import { fetchOrdersSupabase, fetchOrderSupabase } from '@/lib/api/supabaseOrders';
// ============================================================
