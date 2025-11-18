/*

import { Locale } from '@/i18n';
import {
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponseFilters,
} from '@/lib/api/types';

type TemplateListItemRawData = {};

export const transformProductData = (
  data: TemplateListItemRawData[]
): ShopProductListItemData[] => {
  return data.map((e) => {
    const id = `template-${''}`;
    return {
      id,
      brand: 'Template',
      brandId: '',
      name: 'name',
      url: `/product/${id}`,
      imgSrc: '',
      price: {
        originalPrice: 0,
        currentPrice: 0,
        currency: 'TRY',
      },
    };
  });
};

export const getFilters = async (
  searchOptions: ShopSearchOptions,
  locale: Locale
): Promise<ShopSearchResponseFilters | undefined> => {
  return {};
};

*/