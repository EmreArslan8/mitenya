/*

import 'server-only';

import { Locale } from '@/i18n';
import { ShopSearchOptions, ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import { ProductHunter } from '..';
import bringWithProxy from '../../../utils/bringWithProxy';
import translateQuery from '../../../utils/translateQuery';
import {
  getFilters,
  getGenderSearchQuery,
  getSortSearchQuery,
  transformProductData,
  sortOptions,
} from './helpers';

// if nothing is specified
const defaultQuery = 'h&m';
const providerLocale: Locale = 'tr';
const pageSize = 40;

const hmHunter: ProductHunter = async (
  params: ShopSearchOptions
): Promise<ShopSearchResponse | undefined> => {
  let { page = 1, query, locale, nt, gender, sort = 'rcc', category, size, color } = params;
  query = query?.replace('hm', '').replace('h&m', '').trim();
  let translatedQuery = query?.replace('hm', '').replace('h&m', '').trim();
  if (query && !nt) translatedQuery = (await translateQuery(query, providerLocale, locale)).query;
  if (!translatedQuery) translatedQuery = defaultQuery;

  const url = new URL(
    'https://www2.hm.com/tr_tr/search-results/_jcr_content/search.display.json?image-size=small&image=model'
  );
  url.searchParams.append('sort', getSortSearchQuery(sort));
  url.searchParams.append('page-size', pageSize.toString());
  url.searchParams.append('offset', (pageSize * (page - 1)).toString());
  url.searchParams.append('q', translatedQuery);

  if (category) url.searchParams.append('productTypes', category);
  if (size) url.searchParams.append('sizes', size);
  if (color) url.searchParams.append('colorWithNames', color);
  const genderSearchQuery = getGenderSearchQuery(gender);
  url.searchParams.append(genderSearchQuery.name, genderSearchQuery.value);

  try {
    const [res, err] = await bringWithProxy(url.toString(), { next: { revalidate: 1800 } });

    const products = transformProductData(res.products);

    return {
      products,
      totalCount: res.total,
      filters: await getFilters(res.filters, gender, locale),
      sortOptions,
    };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export default hmHunter;
*/