import { sanityClient } from '@/lib/sanity.client';
import {
  allProductsQuery,
  productBySlugQuery,
  allBrandsQuery,
  allCategoriesWithChildrenQuery,
  productsSearchQuery,
  productsByFiltersQuery,
  inlineProductsQuery,
} from '@/lib/sanity.queries';
import { ProductData, CategoryData, BrandData, ShopProductListItemData, ShopSearchOptions, ShopSearchResponse } from './types';
import { bring } from './bring';


/* -------------------------------------------------------------------------- */
/* 🧠 FETCH FONKSİYONLARI */
/* -------------------------------------------------------------------------- */

// ✅ TÜM ÜRÜNLER
export const fetchProducts = async (
  options: Partial<ShopSearchOptions>
): Promise<ShopSearchResponse | undefined> => {
  try {
    const url = '/api/shop/search';
    const res = await bring(url, { params: options });
    return res[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};


export const fetchInlineProducts = async ({
  categories = [],
  brands = [],
  limit = 8,
}: {
  categories?: string[];
  brands?: string[];
  limit?: number;
}) => {
  try {
    const params = {
      categorySlugs: categories,
      brandNames: brands,
      limit,
    };

    const result = await sanityClient.fetch(inlineProductsQuery, params);
    console.log('🟢 fetchInlineProducts output:', result?.length, 'ürün bulundu.');
    return result || [];
  } catch (err) {
    console.error('❌ fetchInlineProducts hata:', err);
    return [];
  }
};



// ✅ TEK ÜRÜN
export const fetchProductData = async (slug: string): Promise<ProductData | null> => {
  try {
    const res = await sanityClient.fetch<ProductData>(productBySlugQuery, { slug });
    return res || null;
  } catch (error) {
    console.error('❌ fetchProductData error:', error);
    return null;
  }
};

// ✅ TÜM KATEGORİLER
export const fetchCategories = async () => {
  try {
    const data = await sanityClient.fetch(allCategoriesWithChildrenQuery);
    return data;
  } catch (error) {
    console.error('❌ [fetchCategories] Hata:', error);
    return [];
  }
};



// ✅ TÜM MARKALAR
export const fetchBrands = async (): Promise<BrandData[]> => {
  try {
    return await sanityClient.fetch<BrandData[]>(allBrandsQuery);
  } catch (error) {
    console.error('❌ fetchBrands error:', error);
    return [];
  }
};

export const fetchRecommendations = async (options: {
  brandId: string;
  productId: string;
}): Promise<ShopProductListItemData[]> => {
  try {
    const url = '/api/shop/recommendations';
    const res = await bring(url, { params: options });
    return res[0];
  } catch (error) {
    console.log(error);
    return [];
  }
};


