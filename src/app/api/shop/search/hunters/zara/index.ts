/*

import { ShopProductListItemData, ShopSearchOptions, ShopSearchSort } from '@/lib/api/types';
import { ProductHunter } from '..';
import bringWithProxy from '../../../utils/bringWithProxy';
import { encrypt, encryptNum } from '../../../utils/crypto';
import translateQuery from '../../../utils/translateQuery';
import { getFilters, getFiltersSearchQuery, getGenderSearchParam, sortOptions } from './helpers';

const resultsPerPage = 72;

const zaraHunter: ProductHunter = async (params: ShopSearchOptions) => {
  const { page = 1, category = '', gender, locale, nt, color } = params;
  let query = params.query ? params.query.toString().replace('zara', '').trim() : '';
  if (!category && !query) query = getGenderSearchParam(gender)?.value ?? 'new';

  let translatedQuery = query;
  if (query && !nt) {
    const { query: newQuery } = await translateQuery(query, 'en', locale);
    if (newQuery) translatedQuery = newQuery;
  }

  const filtersSearchQuery = await getFiltersSearchQuery({ category, locale });

  const requestQuery = `${filtersSearchQuery} ${translatedQuery}`.trim();

  const start = (page - 1) * resultsPerPage;
  let url =
    'https://www.zara.com/itxrest/1/search/store/11766/query?locale=en_GB&deviceType=desktop&deviceOS=Mac%20OS&catalogue=33054&warehouse=24551&scope=default&origin=default&ajax=true&';
  url += `query=${requestQuery}&offset=${start}&limit=${resultsPerPage}&session=${Date.now()}`;

  const genderParam = getGenderSearchParam(gender);
  if (genderParam) url += `&${genderParam.name}=${genderParam.value}`;

  if (color) {
    color.split(',').forEach((color) => {
      url += `&filter=color_facet%3A${color}`;
    });
  }

  // if (ph) url += '&filter=searchSection:SALE';
  try {
    const [res, err] = await bringWithProxy(url, { next: { revalidate: 1800 } });

    if (err) throw new Error('Zara scraper encountered error: ' + err);
    const products = res.results
      .filter((e: any) => e.content.type.toLowerCase() === 'product' && e.content.price)
      .filter((e: any) => !e.content.kind?.toLowerCase().startsWith('frag'))
      .filter((e: any) => !e.content.kind?.toLowerCase().includes('gift'))
      .filter((e: any) => !e.content.sectionName?.toLowerCase().includes('home'))
      .filter(
        (e: any) =>
          e.content.availability === 'in_stock' || e.content.availability === 'low_on_stock'
      )
      .map(transformData)
      .filter((e: ShopProductListItemData | undefined) => e);

    return {
      products,
      totalCount: res.totalResults,
      tq: 'zara ' + translatedQuery,
      filters: await getFilters({ category, gender, locale, color }),
      sortOptions,
    };
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

type ZaraListItemData = {
  content: {
    name: string;
    familyName: string; //category
    sectionName: string;
    seo: {
      keyword: string;
      seoProductId: string;
      discernProductId: string;
    };
    price: number;
    oldPrice?: number;
    xmedia: {
      name: string;
      path: string;
      timestamp: string;
    }[];
  };
};

export function transformData(item: ZaraListItemData): ShopProductListItemData | undefined {
  try {
    const data = item.content;
    const { path, name, timestamp } = data.xmedia?.[0] ?? {};
    // const id = encrypt(
    //   'https://zara.com/tr/en/' +
    //     (data.seo.keyword ?? '') +
    //     '-p' +
    //     data.seo.seoProductId +
    //     '.html?v1=' +
    //     data.seo.discernProductId
    // );
    const id = `zara-${encryptNum(data.seo.discernProductId)}`;

    const product: ShopProductListItemData = {
      id,
      url: `/product/${id}`,
      brand: 'ZARA ' + (data.sectionName?.toUpperCase() ?? ''),
      brandId: '2',
      name: data.name,
      category: data.familyName,
      imgSrc: `https://static.zara.net/photos/${path}/w/512/${name}.jpg?ts=${timestamp}`,
      price: {
        currentPrice: data.price / 100,
        originalPrice: (data.oldPrice ?? data.price) / 100,
        currency: 'TRY',
      },
    };
    return product;
  } catch (error) {
    console.log(error);
    console.log('Error trying to add product, skipping: ');
    // console.log(data);
    return undefined;
  }
}

export default zaraHunter;

*/
