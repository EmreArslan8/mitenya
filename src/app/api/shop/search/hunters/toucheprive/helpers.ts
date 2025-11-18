/*

import { Locale } from '@/i18n';
import {
  ShopFilter,
  ShopProductListItemData,
  ShopSearchResponseFilters,
  ShopSearchSort,
} from '@/lib/api/types';
import { load } from 'cheerio';
import translate from '../../../utils/translate';

export const extractProductHandle = (url: string) => url.match(/\/products\/([^?]+)/)?.[1] || null;

export const getSearchResultsJson = async (html: string) => {
  try {
    const $ = load(html);

    // Find the script tag containing the data
    let scriptContent = '';
    $('script').each((_, element) => {
      const scriptText = $(element).html();
      if (scriptText?.includes('searchResultsJson')) {
        scriptContent = scriptText;
      }
    });

    if (!scriptContent) throw new Error('Could not find searchResultsJson');
    const searchResultsJsonMatch = scriptContent.match(/searchResultsJson\s*=\s*(.*?);/)?.[1];
    if (!searchResultsJsonMatch) throw new Error('Could not match searchResultsJson');
    const rawProducts = JSON.parse(searchResultsJsonMatch);

    const totalCount = parseInt(
      scriptContent.match(/searchResults\s*=\s*parseInt\('(.+?)'\);/)?.[1] ?? '0'
    );

    return { rawProducts, totalCount };
  } catch (error) {
    console.error('Error fetching search results JSON:', error);
    return null;
  }
};

type ToucheRawListItemRawData = {
  title: string;
  handle: string;
  price: number;
  compare_at_price: number;
  featured_image: string;
};

export const transformProductData = (
  data: ToucheRawListItemRawData[]
): ShopProductListItemData[] => {
  return data.map((e) => {
    const id = `toucheprive-${e.handle}`;
    return {
      id,
      brand: 'Touche Prive',
      brandId: 'touche',
      name: e.title,
      url: `/product/${id}`,
      imgSrc: `https:${e.featured_image}`,
      price: {
        currentPrice: e.price / 100,
        originalPrice: (e.compare_at_price || e.price) / 100,
        currency: 'TRY',
      },
    };
  });
};

export const getFilters = async (
  html: string,
  locale: Locale
): Promise<ShopSearchResponseFilters | undefined> => {
  const $ = load(html);

  // Extract size (beden) options
  const sizes: ShopFilter<'size'>[] = (
    $('[name="filter.v.option.beden"]')
      .map((_, element) => {
        const input = $(element);
        const label = input.next().text().trim();
        return {
          type: 'size',
          text: label,
          searchOptions: {
            size: input.val() as string,
          },
          selected: input.is(':checked'),
          allowMultiple: true,
        };
      })
      .get() as ShopFilter<'size'>[]
  ).sort((a: any, b: any) => (a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0));

  // Extract category (urun turu) options
  let categories: ShopFilter<'category'>[] = (
    $('[name="filter.p.product_type"]')
      .map((_, element) => {
        const input = $(element);
        const label = input.next().text().trim();
        return {
          type: 'category',
          text: label,
          searchOptions: {
            category: input.val() as string,
          },
          selected: input.is(':checked'),
          allowMultiple: true,
        };
      })
      .get() as ShopFilter<'category'>[]
  ).sort((a: any, b: any) => (a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0));

  const names = categories.map((e) => e.text);
  const translatedNames = await translate(names, locale);
  categories = categories.map((e, i) => ({ ...e, text: translatedNames[i] }));

  return { categories, sizes };
};

export const sortOptions: ShopSearchSort[] = ['rcc', 'dsc', 'asc'];

export const getSortSearchQuery = (sort?: ShopSearchSort) => {
  switch (sort) {
    case 'dsc':
      return 'price-descending';
    case 'asc':
      return 'price-ascending';
    case 'rcc':
    case 'bst':
    case 'fav':
    case 'rct':
    default:
      return 'relevance';
  }
};

*/