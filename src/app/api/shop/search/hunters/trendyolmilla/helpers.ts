/*

import 'server-only';

import { Locale } from '@/i18n';
import {
  ShopFilter,
  ShopGender,
  ShopProductListItemData,
  ShopSearchOptions,
  ShopSearchResponseFilters,
  ShopSearchSort,
} from '@/lib/api/types';
import { bannedBrands, bannedMerchants, isNotBannedProduct } from '../../../utils/blacklist';
import bringWithProxy from '../../../utils/bringWithProxy';
import { encryptNum } from '../../../utils/crypto';
import translate from '../../../utils/translate';
import capitalize from '@/lib/utils/capitalize';

const trendyolMillaBrandIds = ['165523', '101476', '103500', '143760', '148061'];
export const trendyolMillaBrandIdsEncrypted = ['331063', '202969', '207017', '287537', '296139'];

export const filterExcludedProducts = (data: any) => {
  return data
    .filter((e: any) => isNotBannedProduct({ id: encryptNum(e.id).toString() }))
    .filter((e: any) => !e.categoryHierarchy?.includes('Gıda & İçecek'))
    .filter((e: any) => !bannedBrands.includes(e.brand?.name))
    .filter((e: any) => !bannedMerchants.includes(e.merchantId));
  // .filter((e: any) => !(e.ratingScore?.averageRating < 3.5 && e.ratingScore?.totalCount > 0));
};

export const transformData = (data: any): ShopProductListItemData => {
  const id = `trendyolmilla-${encryptNum(data.id).toString()}-${encryptNum(data.merchantId)}`;

  const product: ShopProductListItemData = {
    id,
    name: data.name,
    url: `/product/${id}`,
    brand: data.brand.name,
    imgSrc: 'https://cdn.dsmcdn.com' + data.images[0],
    price: {
      currentPrice: data.price.discountedPrice ?? data.price.sellingPrice,
      originalPrice: data.price.originalPrice,
      currency: 'TRY',
    },
    rating: data.ratingScore,
    brandId: data.brand.id,
    category: data.categoryId,
  };
  return product;
};

export const getFilters = async (params: URLSearchParams, locale: Locale) => {
  try {
    let url = `https://public.trendyol-milla.com/discovery-web-searchgw-service/v2/api/aggregations/sr?channelId=8&${params}`;
    const [res, err] = await bringWithProxy(url, { next: { revalidate: 1800 } });
    if (err || !res) throw new Error('Could not get filters');
    const filters = await transformFilters(res, locale);
    return filters;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

const transformFilters = async (
  data: any,
  locale: Locale
): Promise<ShopSearchResponseFilters | undefined> => {
  if (!data.isSuccess) return undefined;
  const result = data.result;

  let selectedOptions: Partial<ShopSearchOptions> = {};
  result.selectedFilters
    .filter((e: any) => getFilterType(e.type))
    .forEach((e: any) => {
      const type = getFilterType(e.type)!;
      if (selectedOptions[type])
        selectedOptions[type] += `,${
          type === 'gender' ? getGenderId(e.beautifiedName) : encryptNum(e.id).toString()
        }`;
      else
        selectedOptions[type] =
          type === 'gender' ? getGenderId(e.beautifiedName) : (encryptNum(e.id).toString() as any);
    });

  let categories: ShopFilter<'category'>[] | undefined = result.aggregations
    .find((e: any) => e.group === 'CATEGORY')
    ?.values.map((e: any) => ({
      type: 'category',
      text: e.text,
      searchOptions: { category: encryptNum(e.id).toString() },
      selected: e.filtered,
    }))
    .sort((a: any, b: any) =>
      a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
    );

  if (categories?.length) {
    const names = categories.map((e) => e.text);
    const translatedNames = await translate(names, locale);
    categories = categories.map((e, i) => ({ ...e, text: translatedNames[i] }));
  }

  const brands: ShopFilter<'brand'>[] | undefined = result.aggregations
    .find((e: any) => e.group === 'BRAND')
    ?.values.filter((e: any) => !bannedBrands.includes(e.text))
    .map((e: any) => ({
      type: 'brand',
      text: e.text,
      searchOptions: { brand: encryptNum(e.id).toString() },
      selected: e.filtered,
      allowMultiple: true,
    }))
    .sort((a: any, b: any) =>
      a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
    );

  const genders: ShopFilter<'gender'>[] | undefined = result.aggregations
    .find((e: any) => e.group === 'GENDER')
    ?.values.map((e: any) => ({
      type: 'gender',
      text: getGenderId(e.beautifiedName),
      searchOptions: { gender: getGenderId(e.beautifiedName) },
      selected: e.filtered,
      allowMultiple: true,
    }))
    .sort((a: any, b: any) =>
      a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
    );

  let sizes: ShopFilter<'size'>[] | undefined = result.aggregations
    .find((e: any) => e.group === 'VARIANT' && e.type === 'Size')
    ?.values.map(
      (e: any) =>
        ({
          type: 'size',
          text: e.text,
          searchOptions: { size: e.id },
          selected: e.filtered,
          allowMultiple: true,
        } as ShopFilter<'size'>)
    )
    .sort((a: any, b: any) =>
      a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
    );

  if (sizes?.length) {
    const names = sizes.map((e) => e.text);
    const translatedNames = await translate(names, locale);
    sizes = sizes.map((e, i) => ({ ...e, text: translatedNames[i]?.replaceAll('.', '') }));
  }

  // const priceRanges: ShopFilter<'price'>[] | undefined = result.aggregations
  //   .find((e: any) => e.group === 'PRICE')
  //   ?.values.map((e: any) => {
  //     return {
  //       type: 'price',
  //       text: e.id,
  //       searchOptions: { price: e.id },
  //       selected: e.filtered,
  //       allowMultiple: false,
  //     };
  //   })
  //   .sort((a: any, b: any) =>
  //     a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
  //   );

  // let colors: ShopFilter<'color'>[] | undefined = result.aggregations
  //   .find((e: any) => e.group === 'ATTRIBUTE' && e.type === 'WebColor')
  //   ?.values.map((e: any) => ({
  //     type: 'color',
  //     text: e.text,
  //     searchOptions: { color: e.id },
  //     selected: e.filtered,
  //     allowMultiple: true,
  //   }))
  //   .sort((a: any, b: any) =>
  //     a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
  //   );

  // if (colors?.length) {
  //  const names = colors.map((e) => e.text);
  //  const translatedNames = await translate(names, locale);
  //  colors = colors.map((e, i) => ({ ...e, text: capitalize(translatedNames[i]) }));
  // }
  return { selectedOptions, categories, brands, genders, sizes };
  // return { selectedOptions, categories, genders, sizes, priceRanges, colors };
};

export const getGenderSearchQuery = (gender: ShopGender): { name: string; value: string } => {
  switch (gender) {
    case '1':
      return { name: 'wg', value: '1' };
    case '2':
      return { name: 'wg', value: '2' };
    case '3':
      return { name: 'wg', value: '3' };
    case '4':
      return { name: 'gag', value: '1-2' };
    case '5':
      return { name: 'gag', value: '2-2' };
    case '6':
      return { name: 'gag', value: '1-1' };
    case '7':
      return { name: 'gag', value: '2-1' };
  }
};

const getGenderId = (beautifiedName: string): ShopGender | undefined => {
  switch (beautifiedName) {
    case 'kadin':
      return '1';
    case 'erkek':
      return '2';
    case 'cocuk':
      return '3';
    case 'kiz-cocuk':
      return '4';
    case 'erkek-cocuk':
      return '5';
    case 'kiz-bebek':
      return '6';
    case 'erkek-bebek':
      return '7';
    default:
      return undefined;
  }
};

export const getSortSearchQuery = (sort: ShopSearchSort): { name: string; value: string } => {
  switch (sort) {
    case 'dsc':
      return { name: 'sst', value: 'PRICE_BY_DESC' };
    case 'asc':
      return { name: 'sst', value: 'PRICE_BY_ASC' };
    case 'rcc':
      return { name: 'sst', value: 'SCORE' };
    case 'bst':
      return { name: 'sst', value: 'BEST_SELLER' };
    case 'fav':
      return { name: 'sst', value: 'MOST_FAVOURITE' };
    case 'rct':
      return { name: 'sst', value: 'MOST_RECENT' };
  }
};

export const sortOptions: ShopSearchSort[] = ['rcc', 'dsc', 'asc', 'rct', 'bst', 'fav'];

export const getSizeSearchQuery = (size: string): { name: string; value: string } => {
  const value = 'beden|' + size.replaceAll(',', '_');
  return { name: 'vr', value };
};

const getFilterType = (type: 'WebCategory' | 'WebBrand' | 'WebGender' | 'GenderAgeGroup') => {
  switch (type) {
    case 'WebCategory':
      return 'category';
    case 'WebBrand':
      return 'brand';
    case 'WebGender':
      return 'gender';
    case 'GenderAgeGroup':
      return 'gender';
    default:
      return null;
  }
};

*/