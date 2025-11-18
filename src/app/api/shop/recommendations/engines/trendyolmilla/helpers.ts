/*

import 'server-only';

import { ShopProductListItemData } from '@/lib/api/types';
import { bannedMerchants, isNotBannedProduct } from '../../../utils/blacklist';
import { encryptNum } from '../../../utils/crypto';

type TrendyolmillaRecommendationItem = {
  price: {
    discountedPrice: { value: number };
    originalPrice: { value: number };
    sellingPrice: { value: number };
  };
  merchantId: string;
  id: string;
  name: string;
  brand: { id: string; name: string };
  webBrand: { id: string };
  images: string[];
  ratingScore: { averageRating: number; totalCount: number };
};

const filterExcludedProducts = (data: TrendyolmillaRecommendationItem[], webBrandId: string) => {
  return data
    .filter((e) => isNotBannedProduct({ id: encryptNum(e.id).toString() }))
    .filter((e) => !bannedMerchants.includes(parseInt(e.merchantId ?? 0)))
    .filter((e) => !(e.ratingScore?.averageRating < 3.5 && e.ratingScore?.totalCount > 0));
};

export const transformResults = (
  results: TrendyolmillaRecommendationItem[],
  webBrandId: string
): ShopProductListItemData[] => {
  results = filterExcludedProducts(results, webBrandId);
  return results.map((e) => ({
    id: `trendyolmilla-${encryptNum(e.id)}-${encryptNum(e.merchantId)}`,
    brand: e.brand.name,
    brandId: e.brand.id,
    name: e.name,
    url: `/product/trendyolmilla-${encryptNum(e.id)}-${encryptNum(e.merchantId)}`,
    imgSrc: 'https://cdn.dsmcdn.com' + e.images[0],
    price: {
      originalPrice: e.price.originalPrice.value,
      currentPrice: e.price.discountedPrice?.value ?? e.price.sellingPrice.value,
      currency: 'TRY',
    },
    rating: e.ratingScore.totalCount > 0 ? e.ratingScore : undefined,
  }));
};

*/
