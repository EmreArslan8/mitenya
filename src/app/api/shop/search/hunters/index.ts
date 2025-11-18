/*

import 'server-only';

import { Locale } from '@/i18n';
import bring from '@/lib/api/bring';
import { ShopProductPrice, ShopSearchOptions, ShopSearchResponse } from '@/lib/api/types';
import { Country, getCurrencyForCountry } from '@/lib/utils/countries';
import formatPrice from '@/lib/utils/formatPrice';
import {
  convertProductPrices,
  FIXED_MARKUP,
  MARKUP_RATE,
  normalizePriceRanges,
} from '../../utils/pricing/convertProductPrices';
import getExchangeRate from '../../utils/exchangeRate';
import { translateProductNames } from '../../utils/translateProductNames';
import hiccupHunter from './hiccup';
import hmHunter from './hm';
import touchePriveHunter from './toucheprive';
import trendyolHunter from './trendyol';
import trendyolmillaHunter from './trendyolmilla';
import { trendyolMillaBrandIdsEncrypted } from './trendyolmilla/helpers';
import zaraHunter from './zara';

export type ProductHunter = (req: ShopSearchOptions) => Promise<ShopSearchResponse | undefined>;

// Factory pattern
const hunter = async (req: ShopSearchOptions) => {
  if (req.query && !req.nt && (!req.page || req.page == 1))
    bring(`/api/analytics/search-query?query=${req.query}`);

  let selectedHunter;
  let sourceLocale: Locale = 'tr';
  if (req.brand?.toLowerCase().includes('zara') || req.query?.toLowerCase().includes('zara')) {
    selectedHunter = zaraHunter;
    sourceLocale = 'en';
  } else if (
    req.brand?.toLowerCase().includes('hiccup') ||
    req.query?.toLowerCase().includes('hiccup')
  ) {
    selectedHunter = hiccupHunter;
    sourceLocale = 'en';
  } else if (
    req.brand?.toLowerCase() === 'hm' ||
    req.query?.toLowerCase() === 'hm' ||
    req.query?.toLowerCase().includes('h&m') ||
    req.query?.toLowerCase().includes('hm ') ||
    req.query?.toLowerCase().includes(' hm')
  )
    selectedHunter = hmHunter;
  else if (
    trendyolMillaBrandIdsEncrypted.some((e) => req.brand?.includes(e)) ||
    req.brand?.toLowerCase().includes('trendyol') ||
    req.brand?.toLowerCase().includes('milla') ||
    req.query?.toLowerCase().includes('trendyol') ||
    req.query?.toLowerCase().includes('milla')
  )
    selectedHunter = trendyolmillaHunter;
  // else if (
  //     req.brand?.toLowerCase().includes('toucheprive') ||
  //     req.brand?.toLowerCase().includes('touche') ||
  //     req.query?.toLowerCase() === 'touche' ||
  //     req.query?.toLowerCase().includes('touche ') ||
  //     req.query?.toLowerCase().includes(' prive')
  // ) {
  //  selectedHunter = touchePriveHunter;
  else selectedHunter = trendyolHunter;

  const region = req.region?.toUpperCase() as Country;
  const currency = getCurrencyForCountry(region);
  if (!currency) throw new Error(`Invalid country: ${region}`);

  const exchangeRateTRYToRegion = await getExchangeRate({ from: currency, to: 'TRY' });
  if (!exchangeRateTRYToRegion) throw new Error(`Exchange rate not found: ${currency} to TRY`);

  const exchangeRateUSDToRegion = await getExchangeRate({ from: 'USD', to: currency });
  if (!exchangeRateUSDToRegion) throw new Error(`Exchange rate not found: ${currency} to USD`);

  const convertedMarkup = FIXED_MARKUP * exchangeRateUSDToRegion;

  if (req.price) {
    let [minPrice, maxPrice] = req.price.split('-').map((e) => Number(e) + 1000);

    if (region !== 'UZ') {
      minPrice /= MARKUP_RATE;
      maxPrice /= MARKUP_RATE;
    }

    const minPriceWithoutMarkup = Math.max(
      0,
      (minPrice - convertedMarkup) * exchangeRateTRYToRegion
    );
    const maxPriceWithoutMarkup = (maxPrice - convertedMarkup) * exchangeRateTRYToRegion;
    req.price = `${minPriceWithoutMarkup}-${maxPriceWithoutMarkup}`;
  }

  let res = await selectedHunter(req);
  if (!res) return;

  //const aggregateMarkup = getMarkup(req.region, res.products[0]);
  //const { rate, fixed } = aggregateMarkup;

  const priceRanges = res.filters?.priceRanges;
  if (priceRanges) {
    for (const range of priceRanges) {
      if (range.searchOptions?.price) {
        let [minPrice, maxPrice] = range.searchOptions.price.split('-').map(Number);

        if (region !== 'UZ') {
          minPrice *= MARKUP_RATE;
          maxPrice *= MARKUP_RATE;
        }

        // TODO: DO NOT ASSUME TRY PRICES FOR SOURCES (TRENDYOL etc.)
        const exchangeRateUSDToTRY = await getExchangeRate({ from: 'USD', to: 'TRY' });
        if (!exchangeRateUSDToTRY) throw new Error(`Exchange rate not found: USD to TRY`);

        const fixedMarkupInTRY = FIXED_MARKUP * exchangeRateUSDToTRY;

        const minPriceWithMarkup = minPrice + fixedMarkupInTRY;
        const maxPriceWithMarkup = maxPrice + fixedMarkupInTRY;

        let minPriceInRegion = minPriceWithMarkup / exchangeRateTRYToRegion;
        let maxPriceInRegion = maxPriceWithMarkup / exchangeRateTRYToRegion;

        [minPriceInRegion, maxPriceInRegion] = normalizePriceRanges(
          [minPriceInRegion, maxPriceInRegion],
          currency
        );

        range.searchOptions.price = `${minPriceInRegion}-${maxPriceInRegion}`;

        range.text = `${formatPrice(minPriceInRegion, currency, req.locale, true)} - ${formatPrice(
          maxPriceInRegion,
          currency,
          req.locale
        )}`;
      } else {
        console.warn('Price range not defined for:', range);
        range.text = 'No price information available';
      }
    }
  }

  let translatedNames: string[];
  let convertedPrices: { price: ShopProductPrice }[];
  const translatePromise = translateProductNames(res.products, req.locale, sourceLocale).then(
    (res) => (translatedNames = res)
  );
  const convertPromise = convertProductPrices(res.products, req.region).then(
    (res) => (convertedPrices = res)
  );
  await Promise.all([translatePromise, convertPromise]);
  res.products = res.products.map((e, i) => ({
    ...e,
    name: translatedNames[i],
    price: convertedPrices[i].price,
  }));

  return res;
};

export default hunter;

*/
