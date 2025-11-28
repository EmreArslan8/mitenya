// src/lib/api/shop/hunters/trendyol/helpers.ts
import {
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponseFilters,
} from '@/lib/api/types';
import { Currency } from '@/lib/utils/currencies';

export type TrendyolProduct = {
  id: number;
  name: string;
  brand: string;
  brandId: number;
  category: {
    id: number;
    name: string;
  };
  image: string;
  images: string[];
  url: string;
  price: {
    current: number;
    originalPrice: number;
    discountedPrice: number;
    currency: string;
  };
  ratingScore?: {
    averageRating: number;
    totalCount: number;
  };
};

export type TrendyolSearchResponse = {
  products: TrendyolProduct[];
  totalCount?: number;
  canonicalFilters?: {
    page?: number;
  };
  currency?: string;
};

export const transformProductData = (
  data: TrendyolProduct[]
): ShopProductListItemData[] => {
  return data.map((p) => {
    const id = String(p.id);

    return {
      id,
      name: p.name,
      url: `/product/${id}`,
      brand: p.brand,
      brandId: String(p.brandId),
      imgSrc: p.image || p.images?.[0] || "",
      price: {
        originalPrice: p.price.originalPrice ?? p.price.current,
        currentPrice: p.price.discountedPrice ?? p.price.current,
        currency: (p.price.currency === "TL" ? "TRY" : p.price.currency) as Currency,
      },
      rating: p.ratingScore,

      // ❗ Tek string istiyor → array yapma
      category: String(p.category?.id),
      breadcrumbs: p.category?.name, // ← sadece string
    };
  });
};


export const getFilters = async (
  _searchOptions: ShopSearchOptions
): Promise<ShopSearchResponseFilters | undefined> => {
  // Şimdilik Trendyol kozmetik için filtre paneli kullanmıyoruz.
  // İleride istersen buraya Trendyol aggregations çağrısı ekleriz.
  return {};
};
