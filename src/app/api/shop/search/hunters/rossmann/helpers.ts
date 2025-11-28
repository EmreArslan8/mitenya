import {
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponseFilters,
} from '@/lib/api/types';

import { Currency } from '@/lib/utils/currencies';
import { encrypt } from '../../../utils/crypto';

export type RossmannProduct = {
  ix: number;
  id: string;
  title: string;
  image_link: string;
  price: string;
  sale_price: string;
  brand: string;
  category: string;
  link: string;
  gtin: string;
  scheduled_rule: any[];
};

/* 🔥 Eklenen normalizePage helper */
export const normalizePage = (value: any): number => {
  const num = parseInt(value);
  if (!num || Number.isNaN(num) || num < 1) return 1;
  return num;
};

export const transformProductData = (
  data: RossmannProduct[]
): ShopProductListItemData[] => {
  return data.map((e) => {
    const id = encrypt(e.link);

    return {
      id,
      brand: e.brand,
      brandId: '',
      name: e.title,
      url: `/product/${id}`,
      imgSrc: e.image_link,
      price: {
        originalPrice: parseFloat(e.price),
        currentPrice: parseFloat(e.sale_price),
        currency: 'TRY' as Currency,
      },
    };
  });
};

export const getFilters = async (
  searchOptions: ShopSearchOptions
): Promise<ShopSearchResponseFilters | undefined> => {
  return {};
};
