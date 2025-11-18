/*

import { Locale } from '@/i18n';
import { ShopSearchResponseFilters, ShopSearchSort } from '@/lib/api/types';
import translate from '../../../utils/translate';
import capitalize from '@/lib/utils/capitalize';

const hiccupCategories = {
  bottom: {
    label: 'Bottomwear',
    searchTerm:
      'women-bottom-jeans%2Cwomen-bottom-trousers%2Cwomen-bottom-shorts%2Cwomen-bottom-leggings%2Cwomen-bottom-skirt',
  },
  jeans: { label: 'Jeans', searchTerm: 'women-bottom-jeans' },
  trousers: { label: 'Trousers', searchTerm: 'women-bottom-trousers' },
  shorts: { label: 'Shorts', searchTerm: 'women-bottom-shorts' },
  leggings: { label: 'Leggings', searchTerm: 'women-bottom-leggings' },
  skirt: { label: 'Skirt', searchTerm: 'women-bottom-skirt' },
  coOrds: { label: 'Co-ords', searchTerm: 'women-coords-coords' },
  dress: { label: 'Dress', searchTerm: 'women-dress-midi%2Cwomen-dress-mini%2Cwomen-dress-maxi' },
  midi: { label: 'Midi Dressess', searchTerm: 'women-dress-midi' },
  mini: { label: 'Mini Dressess', searchTerm: 'women-dress-mini' },
  maxi: { label: 'Maxi Dressess', searchTerm: 'women-dress-maxi' },
  loungewear: {
    label: 'Loungewear',
    searchTerm:
      'women-loungewear-sweatshirt%2Cwomen-loungewear-hoodie%2Cwomen-loungewear-activewear%2Cwomen-loungewear-joggers',
  },
  sweatshirt: { label: 'Sweatshirt', searchTerm: 'women-loungewear-sweatshirt' },
  hoodie: { label: 'Hoodie', searchTerm: 'women-loungewear-hoodie' },
  activewear: { label: 'Activewear', searchTerm: 'women-loungewear-activewear' },
  joggers: { label: 'Joggers', searchTerm: 'women-loungewear-joggers' },
  outwear: { label: 'Outwear', searchTerm: 'women-outwear-coatjacket%2Cwomen-outwear-blazer' },
  coatJacket: { label: 'Coats & Jackets', searchTerm: 'women-outwear-coatjacket' },
  blazer: { label: 'Blazer', searchTerm: 'women-outwear-blazer' },
  sweatersKnits: {
    label: 'Sweaters & Knits',
    searchTerm: 'women-sweatersknits-sweater%2Cwomen-sweatersknits-cardigan',
  },
  sweater: { label: 'Sweater', searchTerm: 'women-sweatersknits-sweater' },
  cardigan: { label: 'Cardigan', searchTerm: 'women-sweatersknits-cardigan' },
  top: {
    label: 'Tops',
    searchTerm:
      'women-top-shirt%2Cwomen-top-waistcoat%2Cwomen-top-tshirt%2Cwomen-top-top%2Cwomen-top-camistanks%2Cwomen-top-blouse%2Cwomen-top-croptop%2Cwomen-top-body',
  },
  shirt: { label: 'Shirt', searchTerm: 'women-top-shirt' },
  waistcoat: { label: 'Waistcoat', searchTerm: 'women-top-waistcoat' },
  tShirt: { label: 'T-shirt', searchTerm: 'women-top-tshirt' },
  camisTanks: { label: 'Camis & Tanks', searchTerm: 'women-top-camistanks' },
  blouse: { label: 'Blouse', searchTerm: 'women-top-blouse' },
  cropTop: { label: 'Crop-top', searchTerm: 'women-top-croptop' },
  body: { label: 'Body', searchTerm: 'women-top-body' },
  jumpsuit: { label: 'Jumpsuit', searchTerm: 'women-playsuitsjumpsuits-jumpsuit' },
  playsuit: { label: 'Playsuit', searchTerm: 'women-playsuitsjumpsuits-playsuit' },
  swimwear: {
    label: 'Swimwear',
    searchTerm: 'women-swimwear-bikinisets%2Cwomen-swimwear-onepieces',
  },
};

const hiccupSizes = {
  XXS: { label: 'XXS', searchTerm: 'XXS' },
  XS: { label: 'XS', searchTerm: 'XS' },
  S: { label: 'S', searchTerm: 'S' },
  'S/M': { label: 'S/M', searchTerm: 'S%2FM' },
  M: { label: 'M', searchTerm: 'M' },
  L: { label: 'L', searchTerm: 'L' },
  XL: { label: 'XL', searchTerm: 'XL' },
  XXL: { label: 'XXL', searchTerm: 'XXL' },
  '3XL': { label: '3XL', searchTerm: '3XL' },
  'L/XL': { label: 'L/XL', searchTerm: 'L%2FXL' },
  'M/L': { label: 'M/L', searchTerm: 'M%2FL' },
};

const hiccupColors = {
  grey: { label: 'Grey', searchTerm: 'grey' },
  khaki: { label: 'Khaki', searchTerm: 'khaki' },
  camel: { label: 'Camel', searchTerm: 'camel' },
  denim: { label: 'Denim', searchTerm: 'denim' },
  pink: { label: 'Pink', searchTerm: 'pink' },
  black: { label: 'Black', searchTerm: 'black' },
  green: { label: 'Green', searchTerm: 'green' },
  orange: { label: 'Orange', searchTerm: 'orange' },
  ecru: { label: 'Ecru', searchTerm: 'ecru' },
  beige: { label: 'Beige', searchTerm: 'beige' },
  brown: { label: 'Brown', searchTerm: 'brown' },
  yellow: { label: 'Yellow', searchTerm: 'yellow' },
  white: { label: 'White', searchTerm: 'white' },
  blue: { label: 'Blue', searchTerm: 'blue' },
  red: { label: 'Red', searchTerm: 'red' },
  purple: { label: 'Purple', searchTerm: 'purple' },
};

const hiccupDefaultFilters: ShopSearchResponseFilters = {
  categories: Object.values(hiccupCategories).map((e) => ({
    type: 'category',
    text: e.label,
    searchOptions: { category: e.searchTerm },
  })),
  sizes: Object.values(hiccupSizes).map((e) => ({
    type: 'size',
    text: e.label,
    searchOptions: { size: e.searchTerm },
    allowMultiple: true,
  })),
  // colors: Object.values(hiccupColors).map((e) => ({
  //   type: 'color',
  //   text: e.label,
  //   searchOptions: { color: e.searchTerm },
  //   allowMultiple: true,
  // })),
};

export const getFilters = async ({
  category,
  size,
  color,
  locale,
}: {
  category?: string;
  size?: string;
  color?: string;
  locale: Locale;
}) => {
  let categories = hiccupDefaultFilters.categories!;
  const categoryNames = categories.map((e) => e.text);
  const translatedCategoryNames = await translate(categoryNames, locale);
  categories = categories
    .map((e, i) => ({
      ...e,
      text: translatedCategoryNames[i],
      selected: e.searchOptions.category === category,
    }))
    .sort((a: any, b: any) =>
      a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
    );

  const selectedSizes = size?.split(',');
  let sizes = hiccupDefaultFilters.sizes!;
  sizes = sizes
    .map((e) => ({ ...e, selected: selectedSizes?.includes(e.searchOptions.size!) }))
    .sort((a: any, b: any) =>
      a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
    );

  // const selectedColors = color?.split(',');
  // let colors = hiccupDefaultFilters.colors!;
  // const colorNames = colors.map((e) => e.text);
  // const translatedColorNames = await translate(colorNames, locale);
  // colors = colors
  //   .map((e, i) => ({
  //     ...e,
  //     text: capitalize(translatedColorNames[i]),
  //     selected: selectedColors?.includes(e.searchOptions.color!),
  //   }))
  //   .sort((a: any, b: any) =>
  //     a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
  //   );

  // return { categories, sizes, colors };
  return { categories, sizes };
};

export const sortOptions: ShopSearchSort[] = ['rcc', 'dsc', 'asc'];

export const getSortSearchQuery = (sort: ShopSearchSort) => {
  switch (sort) {
    case 'dsc':
      return 'highLow';
    case 'asc':
      return 'lowHigh';
    case 'rcc':
    case 'bst':
    case 'fav':
      return 'recommended';
    case 'rct':
      return 'new';
  }
};

export type HiccupListItemRawData = {
  id: string;
  name: string;
  price: number; // current price
  rrp: number; // original price
  primarySkuPrefix: string;
  productVariants: { [key: string]: { images: { image: string }[] } };
  category: string;
};

*/