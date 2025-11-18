/*

import { Locale } from '@/i18n';
import { ShopFilter, ShopGender, ShopSearchResponseFilters, ShopSearchSort } from '@/lib/api/types';
import translate from '../../../utils/translate';
import capitalize from '@/lib/utils/capitalize';

export const defaultFilters: ShopSearchResponseFilters = {
  categories: [
    { type: 'category', text: 'Dresses', searchOptions: { category: 'dresses' } },
    { type: 'category', text: 'Shorts', searchOptions: { category: 'shorts' } },
    { type: 'category', text: 'Shirts', searchOptions: { category: 'shirts' } },
    { type: 'category', text: 'T-shirts', searchOptions: { category: 'tshirts' } },
    { type: 'category', text: 'Blazers', searchOptions: { category: 'blazers' } },
    { type: 'category', text: 'Skirts', searchOptions: { category: 'skirts' } },
    { type: 'category', text: 'Pants', searchOptions: { category: 'pants' } },
    { type: 'category', text: 'Blouses', searchOptions: { category: 'blouses' } },
    // { type: 'category', text: 'Perfume', searchOptions: { category: 'perfume' } },
    { type: 'category', text: 'Beachwear', searchOptions: { category: 'beachwear' } },
    { type: 'category', text: 'Jackets', searchOptions: { category: 'jackets' } },
    { type: 'category', text: 'Jeans', searchOptions: { category: 'jeans' } },
    { type: 'category', text: 'Pyjamas', searchOptions: { category: 'pyjamas' } },
    { type: 'category', text: 'Sweaters', searchOptions: { category: 'sweaters' } },
    { type: 'category', text: 'Coats', searchOptions: { category: 'coats' } },
    { type: 'category', text: 'Shoes', searchOptions: { category: 'shoes' } },
    { type: 'category', text: 'Accessories', searchOptions: { category: 'accessories' } },
  ],
  genders: [
    { type: 'gender', text: '1', searchOptions: { gender: '1' } },
    { type: 'gender', text: '2', searchOptions: { gender: '2' } },
    { type: 'gender', text: '3', searchOptions: { gender: '3' } },
  ],
  // colors: [
  //   { type: 'color', text: 'Beige', searchOptions: { color: 'filterbeige' } },
  //   { type: 'color', text: 'White', searchOptions: { color: 'filterwhite' } },
  //   { type: 'color', text: 'Magenta', searchOptions: { color: 'filtermagenta' } },
  //   { type: 'color', text: 'Grey', searchOptions: { color: 'filtergrey' } },
  //   { type: 'color', text: 'Khaki', searchOptions: { color: 'filterkhaki' } },
  //   { type: 'color', text: 'Brown', searchOptions: { color: 'filterbrown' } },
  //   { type: 'color', text: 'Red', searchOptions: { color: 'filterred' } },
  //   { type: 'color', text: 'Blue', searchOptions: { color: 'filterblue' } },
  //   { type: 'color', text: 'Metallic', searchOptions: { color: 'filtermetallic' } },
  //   { type: 'color', text: 'Pink', searchOptions: { color: 'filterpink' } },
  //   { type: 'color', text: 'Yellow', searchOptions: { color: 'filteryellow' } },
  //   { type: 'color', text: 'Black', searchOptions: { color: 'filterblack' } },
  //   { type: 'color', text: 'Orange', searchOptions: { color: 'filterorange' } },
  //   { type: 'color', text: 'Green', searchOptions: { color: 'filtergreen' } },
  // ],
};

export const getFilters = async ({
  category,
  gender,
  locale,
  color,
}: {
  category?: string;
  gender?: string;
  locale: Locale;
  color?: string;
}) => {
  const genders = defaultFilters.genders
    ?.map((e) => (e.searchOptions.gender === gender ? { ...e, selected: true } : e))
    .sort((a: any, b: any) =>
      a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
    );

  let categories = defaultFilters.categories
    ?.map((e) => (e.searchOptions.category === category ? { ...e, selected: true } : e))
    .sort((a: any, b: any) =>
      a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
    );

  // const selectedColors = color?.split(',');
  // let colors = defaultFilters.colors!;
  // const colorNames = colors?.map((e) => e.text);
  // const translatedColorNames = await translate(colorNames, locale);

  // colors = colors
  //   .map((e, i) => ({
  //     ...e,
  //     text: capitalize(translatedColorNames[i]),
  //     selected: selectedColors?.includes(e.searchOptions.color!),
  //     allowMultiple: true,
  //   }))
  //   .sort((a: any, b: any) =>
  //     a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
  //   );

  if (categories?.length) {
    const names = categories.map((e) => e.text);
    const translatedNames = await translate(names, locale);
    categories = categories.map((e, i) => ({ ...e, text: translatedNames[i] }));
  }

  // if (colors?.length) {
  //   colors = colors.map((e, i) => ({ ...e, text: capitalize(translatedColorNames[i]) }));
  // }

  // return { categories, genders, colors };
  return { categories, genders };
};

export const getFiltersSearchQuery = async ({
  category,
  locale,
}: {
  category?: string;
  locale: Locale;
}) => {
  let categoryString = '';
  if (category) {
    const defaultFiltersMatch = defaultFilters.categories?.find(
      (e) => e.searchOptions.category === category
    )?.searchOptions.category;
    if (defaultFiltersMatch) categoryString = defaultFiltersMatch;
    else categoryString = (await translate([category], 'en', locale))[0];
  }

  return categoryString.trim();
};

export const getGenderSearchParam = (
  gender?: ShopGender
): { name: string; value: string } | undefined => {
  switch (gender) {
    case '1':
      return { name: 'section', value: 'WOMAN' };
    case '2':
      return { name: 'section', value: 'MAN' };
    case '3':
      return { name: 'section', value: 'KID' };
    default:
      // return { name: 'section', value: 'WOMAN' };
      return undefined;
  }
};

export const sortOptions: ShopSearchSort[] = [];

*/
