/*

import 'server-only';

import {
  ShopGender,
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponseFilters,
} from '@/lib/api/types';
import { ProductHunter } from '..';
import { getMerchantParam } from '../../../utils/blacklist';
import bringWithProxy from '../../../utils/bringWithProxy';
import { decryptNum } from '../../../utils/crypto';
import translateQuery from '../../../utils/translateQuery';
import {
  filterExcludedProducts,
  getFilters,
  getGenderSearchQuery,
  getSizeSearchQuery,
  getSortSearchQuery,
  transformData,
  sortOptions,
} from './helpers';

// NOTE: _S1 stands for offset.

const trendyolHunter: ProductHunter = async (params: ShopSearchOptions) => {
  try {
    let {
      page = 1,
      query = '',
      brand = '',
      category = '',
      sort,
      gender,
      size,
      locale,
      nt,
      nf,
      _S1,
      ph,
      collection,
      xt,
      color,
      price,
      region,
    } = params;

    let translatedQuery = query;
    if (query && !nt) {
      const { extractedBrand, query: newQuery } = await translateQuery(query, 'tr', locale);
      if (newQuery) translatedQuery = newQuery;
      if (extractedBrand) brand = brand ? brand + ',' + extractedBrand : extractedBrand;
    }

    let requestQuery = translatedQuery;

    const merchantParam = getMerchantParam({ query, brand, category, collection });

    const usesCategoryIds = category.split(',').some((e) => !isNaN(parseInt(e)));
    if (usesCategoryIds)
      category = category
        .split(',')
        .filter((e) => !isNaN(parseInt(e)))
        .map((e) => decryptNum(e))
        .join(',');

    const usesBrandIds = brand.split(',').some((e) => !isNaN(parseInt(e)));
    if (usesBrandIds)
      brand = brand
        .split(',')
        .filter((e) => !isNaN(parseInt(e)))
        .map((e) => decryptNum(e))
        .join(',');

    const productSearchParams = new URLSearchParams({
      pi: page.toString(),
      isLegalRequirementConfirmed: 'true',
    });
    const filterSearchParams = new URLSearchParams({});

    if (usesCategoryIds)
      category.split(',').forEach((e) => {
        productSearchParams.append('wc', e);
        filterSearchParams.append('wc', e);
      });
    else if (category) requestQuery = `${category} ${requestQuery}`;

    if (usesBrandIds)
      brand.split(',').forEach((e) => {
        productSearchParams.append('wb', e);
        filterSearchParams.append('wb', e);
      });
    else if (brand) requestQuery = `${brand} ${requestQuery}`;

    if (gender) {
      gender.split(',').forEach((e) => {
        const { name, value } = getGenderSearchQuery(e as ShopGender);
        productSearchParams.append(name, value);
        filterSearchParams.append(name, value);
      });
    }

    if (size) {
      const { name, value } = getSizeSearchQuery(size);
      productSearchParams.append(name, value);
      filterSearchParams.append(name, value);
    }

    if (price) {
      productSearchParams.append('prc', price);
      filterSearchParams.append('prc', price);
    }

    if (sort) {
      const sortParam = getSortSearchQuery(sort);
      productSearchParams.append(sortParam.name, sortParam.value);
      filterSearchParams.append(sortParam.name, sortParam.value);
    }

    if (requestQuery) {
      productSearchParams.append('q', requestQuery.trim());
      filterSearchParams.append('q', requestQuery.trim());
    }

    if (_S1 && !isNaN(parseInt(_S1))) productSearchParams.append('offset', _S1);

    if (ph && !isNaN(parseInt(ph))) {
      productSearchParams.append('lpd', ph);
      filterSearchParams.append('lpd', ph);
    }

    if (merchantParam) {
      productSearchParams.append(merchantParam.key, merchantParam.value);
      filterSearchParams.append(merchantParam.key, merchantParam.value);
    }

    if (xt) {
      const extraParams = new URLSearchParams(decodeURIComponent(xt));
      extraParams.forEach((value, key) => {
        productSearchParams.append(key, value);
        filterSearchParams.append(key, value);
      });
    }

    if (color) {
      productSearchParams.append('wcl', color);
      filterSearchParams.append('wcl', color);
    }

    let products: ShopProductListItemData[] = [];
    let totalCount: number = 0;
    let filters: ShopSearchResponseFilters | undefined;
    let offset: any = undefined;

    const productsPromise = (async () => {
      let productsUrl =
        'https://public.trendyol.com/discovery-web-searchgw-service/v2/api/filter/sr?channelId=1&' +
        productSearchParams.toString();

      const productsRes = await bringWithProxy(productsUrl, { next: { revalidate: 1800 } });

      const [res, err] = productsRes;
      if (err) throw new Error(err.message);
      const result = res.result;
      totalCount = result.totalCount;
      offset = result.offset;
      products = filterExcludedProducts(result.products).map((e: any) => transformData(e));
    })();

    const filtersPromise =
      !nf && getFilters(filterSearchParams, locale).then((res) => (filters = res));

    await Promise.all([productsPromise, filtersPromise]);

    return {
      products,
      totalCount,
      tq: translatedQuery,
      filters,
      sortOptions,
      session: { _S1: offset?.toString() },
    };
  } catch (err) {
    console.log(`Trendyol Hunter Error: ${JSON.stringify(params)}`, err);
    return undefined;
  }
};

export default trendyolHunter;

*/
