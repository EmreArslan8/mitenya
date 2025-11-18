/*

import 'server-only';

import { Locale } from '@/i18n';
import { ShopSearchOptions, ShopSearchSort} from '@/lib/api/types';
import { ProductHunter } from '..';
import translateQuery from '../../../utils/translateQuery';
import { getFilters, getSearchResultsJson, getSortSearchQuery, transformProductData, sortOptions } from './helpers';

// if nothing is specified
const defaultQuery = 'new';
const providerLocale: Locale = 'tr';


const touchePriveHunter: ProductHunter = async (params: ShopSearchOptions) => {
  let { page = 1, query, locale, nt, sort = 'rcc', category, size } = params;
  query = query?.replace('touche ', '').replace('touche', '').replace('prive', '');
  let translatedQuery = query;
  if (query && !nt) translatedQuery = (await translateQuery(query, providerLocale, locale)).query;
  if (!translatedQuery) translatedQuery = defaultQuery;

  const url = new URL('https://toucheprive.com/search?type=product&options[prefix]=last');
  url.searchParams.append('q', translatedQuery);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('sort_by', getSortSearchQuery(sort));
  if (category)
    category.split(',').forEach((e) => url.searchParams.append('filter.p.product_type', e));
  if (size) size.split(',').forEach((e) => url.searchParams.append('filter.v.option.beden', e));

  try {
    const response = await fetch(url.toString(), { next: { revalidate: 1800 } });

    const html = await response.text();
    const data = await getSearchResultsJson(html);
    if (!data) throw new Error('Error fetching Touche Prive');
    const products = transformProductData(data?.rawProducts);

    return {
      products,
      totalCount: data?.totalCount,
      filters: await getFilters(html, locale),
      sortOptions, 
    };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export default touchePriveHunter;

*/