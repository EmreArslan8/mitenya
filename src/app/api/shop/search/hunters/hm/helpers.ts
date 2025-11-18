/*

import { Locale } from '@/i18n';
import {
  ShopFilter,
  ShopGender,
  ShopProductListItemData,
  ShopSearchResponseFilters,
  ShopSearchSort,
} from '@/lib/api/types';
import { encryptNum } from '../../../utils/crypto';
import translate from '../../../utils/translate';
import capitalize from '@/lib/utils/capitalize';

type HmListItemRawData = {
  articleCode: string;
  title: string;
  image: { src: string }[];
  price: string;
  redPrice: string;
  brandName: string;
  brandId: string;
  category: string;
};

type HmFilterData = {
  id: 'sizes' | 'productTypes' | 'colorWithNames';
  group?: {
    filtervalues: { name: string; code: string; selected: boolean; disabled: boolean }[];
  }[];
  filtervalues?: { name: string; code: string; selected: boolean; disabled: boolean }[];
}[];

export const transformProductData = (data: HmListItemRawData[]): ShopProductListItemData[] => {
  return data.map((e) => {
    const id = `hm-${encryptNum(e.articleCode)}`;
    const originalPrice = parseFloat(e.price.replace(/\s/g, '').replace('TL', ''));
    const currentPrice = e.redPrice
      ? parseFloat(e.redPrice.replace(/\s/g, '').replace('TL', ''))
      : originalPrice;

    return {
      id,
      brand: e.brandName ?? 'H&M',
      brandId: 'hm',
      name: e.title,
      url: `/product/${id}`,
      imgSrc: e.image[0].src,
      price: { originalPrice, currentPrice, currency: 'TRY' },
      category: e.category,
    };
  });
};

export const getFilters = async (
  hmFilterData: HmFilterData,
  gender: ShopGender | undefined,
  locale: Locale
): Promise<ShopSearchResponseFilters | undefined> => {
  let sizes: ShopFilter<'size'>[] | undefined;
  try {
    let sizesRaw = hmFilterData.find((e) => e.id === 'sizes');
    if (sizesRaw && !sizesRaw?.group && sizesRaw.filtervalues)
      sizesRaw.group = [{ filtervalues: sizesRaw.filtervalues }];
    sizes = sizesRaw
      ?.group!.flatMap((e) =>
        e.filtervalues
          .filter((v) => !v.disabled)
          .map(
            (v) =>
              ({
                type: 'size',
                text: v.name.toUpperCase(),
                selected: v.selected,
                allowMultiple: true,
                searchOptions: { size: v.code },
              } as ShopFilter<'size'>)
          )
      )
      .sort((a: any, b: any) =>
        a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
      );
  } catch (error) {
    console.log('hm sizes error:', error);
  }

  let categories: ShopFilter<'category'>[] | undefined;
  try {
    categories = hmFilterData
      .find((e) => e.id === 'productTypes')
      ?.filtervalues?.filter(
        (v) => !v.disabled && v.name.toLowerCase() !== 'alt değiştirme minderi örtüsü'
      )
      .map(
        (v) =>
          ({
            type: 'category',
            text: v.name,
            selected: v.selected,
            allowMultiple: true,
            searchOptions: { category: decodeURIComponent(v.code) },
          } as ShopFilter<'category'>)
      )
      .sort((a: any, b: any) =>
        a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0
      );

    if (categories?.length) {
      const names = categories.map((e) => {
        switch (e.text) {
          case 'Üst':
            return 'Üst Giyim';
          case 'Külot':
            return 'İç Çamaşır';
          case 'Bikini Altı':
            return 'Bikini';
          default:
            return e.text;
        }
      });

      const translatedNames = await translate(names, locale);
      categories = categories.map((e, i) => ({ ...e, text: translatedNames[i] }));
    }
  } catch (error) {
    console.log('hm categories error:', error);
  }

  // const colorsRaw = hmFilterData.find((e) => e.id === 'colorWithNames')?.filtervalues;
  // const colors: ShopFilter<'color'>[] | undefined = colorsRaw
  //   ? await (async () => {
  //       const translatedColorNames = await translate(
  //         colorsRaw.map((v) => v.name),
  //         locale
  //       );
  //       return colorsRaw
  //         .filter((v) => !v.disabled)
  //         .map((v, i) => {
  //           const formattedColorNames = `${v.name.toLowerCase()}_${v.code.split('_')[1]}`;
  //           return {
  //             type: 'color' as const,
  //             text: capitalize(translatedColorNames[i]),
  //             selected: v.selected,
  //             searchOptions: { color: formattedColorNames },
  //             allowMultiple: true,
  //           };
  //         })
  //         .sort((a, b) => (a.selected || b.selected ? (a.selected && !b.selected ? -1 : 1) : 0));
  //     })()
  //   : undefined;

  let genders: ShopFilter<'gender'>[] = [
    {
      type: 'gender',
      text: '1',
      selected: gender === '1',
      searchOptions: { gender: '1' },
    },
    {
      type: 'gender',
      text: '2',
      selected: gender === '2',
      searchOptions: { gender: '2' },
    },
    {
      type: 'gender',
      text: '3',
      selected: gender === '3',
      searchOptions: { gender: '3' },
    },
  ];

  // return { categories, genders, sizes, colors };
  return { categories, genders, sizes };
};

export const getGenderSearchQuery = (
  gender: ShopGender | undefined
): { name: string; value: string } => {
  switch (gender) {
    case '1':
      return { name: 'department', value: 'ladies_all' };
    case '2':
      return { name: 'department', value: 'men_all' };
    case '3':
    case '4':
    case '5':
      return { name: 'department', value: 'kids_all' };
    case '6':
    case '7':
      return { name: 'department', value: 'kids_newbornbaby_viewall' };
    default:
      return { name: 'department', value: '1' };
  }
};

export const sortOptions: ShopSearchSort[] = ['rcc', 'dsc', 'asc', 'rct'];

export const getSortSearchQuery = (sort: ShopSearchSort) => {
  switch (sort) {
    case 'rct':
      return 'newProduct';
    case 'dsc':
      return 'descPrice';
    case 'asc':
      return 'ascPrice';
    case 'bst':
    case 'fav':
    case 'rcc':
    default:
      return 'stock';
  }
};

*/