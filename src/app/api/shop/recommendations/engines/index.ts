import 'server-only';
import { ShopProductListItemData, ShopProductPrice } from '@/lib/api/types';
import trendyolRecommendationEngine from './trendyol';
import { translateProductNames } from '../../utils/translateProductNames';
import { convertProductPrices } from '../../utils/pricing/convertProductPrices';
import { Locale } from '@/i18n';
import { Region } from '@/lib/shop/regions';
import zaraRecommendationEngine from './zara';
import { trendyolMillaBrandIdsEncrypted } from '../../search/hunters/trendyolmilla/helpers';
import trendyolmillaRecommendationEngine from './trendyolmilla';
import hmRecommendationEngine from './hm';

export type RecommendationEngine = ({
  brandId,
  productId,
  locale,
  region,
}: {
  brandId: string;
  productId: string;
  locale: Locale;
  region: Region;
}) => Promise<ShopProductListItemData[]>;

export const recommendationEngine: RecommendationEngine = async ({
  brandId,
  productId,
  locale,
  region,
}) => {
  let engine: RecommendationEngine;

  if (brandId === '2') engine = zaraRecommendationEngine;
  else if (trendyolMillaBrandIdsEncrypted.includes(brandId))
    engine = trendyolmillaRecommendationEngine;
  else if (brandId === 'hm') engine = hmRecommendationEngine;
  else engine = trendyolRecommendationEngine;

  let products = await engine({ brandId, productId, locale, region });

  let translatedNames: string[];
  let convertedPrices: { price: ShopProductPrice }[];
  const translatePromise = translateProductNames(products, locale).then(
    (res) => (translatedNames = res)
  );
  const convertPromise = convertProductPrices(products, region).then(
    (res) => (convertedPrices = res)
  );
  await Promise.all([translatePromise, convertPromise]);
  products = products.map((e, i) => ({
    ...e,
    name: translatedNames[i],
    price: convertedPrices[i].price,
  }));
  return products;
};
