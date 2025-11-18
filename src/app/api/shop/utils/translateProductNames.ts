/*

import 'server-only';

import { Locale } from '@/i18n';
import { ShopProductData, ShopProductListItemData } from '@/lib/api/types';
import translate from './translate';

export const translateProductNames = async (
  products: ShopProductListItemData[],
  target: Locale,
  source?: Locale
) => {
  const names = products.map((e) => e.name);
  return await translate(names, target, source);
};

export const translateProductName = async (
  product: ShopProductData,
  target: Locale,
  source?: Locale
) => {
  if (!product.name) return '';
  return (await translate([product.name], target, source))[0];
};

export const translateProductDescription = async (product: ShopProductData, target: Locale) => {
  if (!product.description) return;
  return (await translate([product.description], target))[0];
};

export const translateProductAttributes = async (product: ShopProductData, target: Locale) => {
  if (!product.attributes) return;
  const flatAttributes = product.attributes.flatMap((e) => [e.name, e.value]);
  let translatedFlatAttributes = await translate(flatAttributes, target);
  let translatedAttributes = [];
  for (let i = 0; i < translatedFlatAttributes.length; i = i + 2) {
    translatedAttributes.push({
      name: translatedFlatAttributes[i],
      value: translatedFlatAttributes[i + 1],
    });
  }
  return translatedAttributes;
};

*/