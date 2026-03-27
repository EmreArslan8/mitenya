

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
    if (options.collection) params.set('collection', options.collection);
    if (options.query) params.set('query', options.query);
    if (options.price) params.set('price', options.price);

    const url = `/api/products?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (error) {
    console.error('Fetch products error:', error);
    return undefined;
  }
};

export const fetchProductData = async (
  id: string,
  baseUrl?: string
): Promise<ShopProductData | undefined> => {
  try {
    const url = baseUrl ? new URL(`/api/products/${id}`, baseUrl).toString() : `/api/products/${id}`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return await res.json();
  } catch (error) {
    console.error('Fetch product error:', error);
    return undefined;
  }
};

export const fetchProductsByIds = async (
  ids: string[]
): Promise<ShopProductData[]> => {
  try {
    const res = await fetch('/api/products/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch (error) {
    console.error('Fetch products batch error:', error);
    return [];
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
  categoryId?: string;
}): Promise<ShopProductListItemData[]> => {
  try {
    const params = new URLSearchParams({ brandId: options.brandId });
    if (options.categoryId) params.set('categoryId', options.categoryId);

    const res = await fetch(
      `/api/products/${options.productId}/recommendations?${params.toString()}`
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
