/*

import 'server-only';

import { ShopSearchOptions } from '@/lib/api/types';
import { ProductHunter } from '..';
import bringWithProxy from '../../../utils/bringWithProxy';
import translateQuery from '../../../utils/translateQuery';
import { getFilters, transformProductData } from './helpers';
import { Locale } from '@/i18n';

// if nothing is specified
const defaultQuery = 'new';
const providerLocale: Locale = 'tr';

const templateHunter: ProductHunter = async (params: ShopSearchOptions) => {
  const { page = 1, query, locale, nt, sort = 'rcc', category, size } = params;
  let translatedQuery = query;
  if (query && !nt) translatedQuery = (await translateQuery(query, providerLocale, locale)).query;
  if (!translatedQuery) translatedQuery = defaultQuery;

  const url = new URL('');
  url.searchParams.append('page', page.toString());

  try {
    const [res, err] = await bringWithProxy(url.toString(), { next: { revalidate: 1800 } });
    console.log('fetching...:', url.toString());
    const data = res.data;

    const products = transformProductData(data.products);

    return {
      products,
      totalCount: res.totalCount,
      filters: await getFilters(params, locale),
    };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export default templateHunter;

*/
