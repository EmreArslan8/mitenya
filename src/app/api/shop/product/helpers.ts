
/*
import 'server-only';

import { ShopProductBreadcrumb, ShopProductReview } from '@/lib/api/types';
import translate from '../utils/translate';

// const getWebsiteName = (url: string) =>
 // RegExp(/^(?:www\.)?(.*)\.[a-z]{2,}$/i).exec(new URL(url).hostname)?.[1];

export const translateProductReviews = async (
  reviews: ShopProductReview[],
  target: Locale
): Promise<ShopProductReview[] | undefined> => {
  if (!reviews) return;
  const texts = reviews.map((e) => e.text);
  const translatedTexts = await translate(texts, target);
  const translatedReviews = reviews.map((e, i) => ({ ...e, text: translatedTexts[i] }));
  return translatedReviews;
};

export const transformBreadcrumbs = async (
  breadcrumbs: string | undefined,
  target: Locale
): Promise<ShopProductBreadcrumb[] | undefined> => {
  if (!breadcrumbs) return undefined;
  try {
    let transformedBreadcrumbs = breadcrumbs
      .split('/')
      .map((e) => ({ searchOptions: { category: e } }));
    const translatedBreadcrumbs = await translate(breadcrumbs.split('/'), target);
    transformedBreadcrumbs = transformedBreadcrumbs.map((e, i) => ({
      ...e,
      text: translatedBreadcrumbs[i],
    }));
    return transformedBreadcrumbs as ShopProductBreadcrumb[];
  } catch (error) {
    return undefined;
  }
};
*/