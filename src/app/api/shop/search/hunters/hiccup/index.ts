/*

import {
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponse,
  ShopSearchSort,
} from '@/lib/api/types';
import { ProductHunter } from '..';
import bringWithProxy from '../../../utils/bringWithProxy';
import translateQuery from '../../../utils/translateQuery';
import { HiccupListItemRawData, getFilters, getSortSearchQuery, sortOptions } from './helpers';

const hiccupHunter: ProductHunter = async (
  params: ShopSearchOptions
): Promise<ShopSearchResponse | undefined> => {
  const { page = 1, query, locale, nt, sort = 'rcc', category, size, color, xt } = params;
  let translatedQuery = query?.replace('hiccup', '');
  if (query && !nt)
    translatedQuery = (await translateQuery(query?.replace('hiccup', ''), 'en', locale)).query;

  const url = new URL('https://hiccup.com/backend/api/catalog/query/paged');
  url.searchParams.append('page', page.toString());
  url.searchParams.append('sortOption', getSortSearchQuery(sort));
  if (translatedQuery) url.searchParams.append('search', translatedQuery);
  if (category) url.searchParams.append('categories', category);
  if (size) url.searchParams.append('sizes', size);
  if (color) url.searchParams.append('colors', color);
  if (xt) {
    const extraParams = new URLSearchParams(decodeURIComponent(xt));
    extraParams.forEach((v, k) => url.searchParams.append(k, v));
  }
  try {
    const [res, err] = await bringWithProxy(url.toString(), { next: { revalidate: 1800 } });
    const data: HiccupListItemRawData[] = res.data ?? [];
    const products: ShopProductListItemData[] = data.map((e) => {
      const imgSrc = e.productVariants[e.primarySkuPrefix].images[0].image;
      const id = `hiccup-${e.id}-${e.primarySkuPrefix}`;
      const category = e.category?.split('/').pop();
      return {
        id,
        url: `/product/${id}`,
        name: e.name,
        brand: 'Hiccup',
        brandId: 'hiccup',
        category,
        imgSrc,
        price: { originalPrice: e.rrp / 100, currentPrice: e.price / 100, currency: 'GBP' },
      };
    });

    return {
      products,
      totalCount: res.totalCount,
      filters: await getFilters({ category, size, color, locale }),
      sortOptions,
    };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export default hiccupHunter;

*/
