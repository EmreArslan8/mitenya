import "server-only";

import { ShopProductPrice, ShopProductVariantData } from "@/lib/api/types";
import { Region } from "@/lib/shop/regions";
import { Country, getCurrencyForCountry } from "@/lib/utils/countries";
import { Currency } from "@/lib/utils/currencies";
import getExchangeRate from "../exchangeRate";
import getMarkup from "./markups";
import { bring } from "@/lib/api/bring";

export const MARKUP_RATE = 1.15;
export const FIXED_MARKUP = 6; // USD

export type ProductLike = {
  id: string;
  price: ShopProductPrice;
  brand?: string;
  brandId?: string;
  category?: string;
  breadcrumbs?: string;
  variants?: ShopProductVariantData[];
};

const markupProductPrices = async <T extends ProductLike>(
  products: T[],
  region: Region
): Promise<T[]> => {
  const exchangeRate = await getExchangeRate({
    from: "USD",
    to: products[0].price.currency,
  });
  if (!exchangeRate) throw new Error("Exchange rate not available");

  return products.map((e) => {
    const aggregateMarkup = getMarkup(region, {
      ...e,
      price: {
        ...e.price,
        originalPrice: e.price.originalPrice / exchangeRate,
      }, // Send as USD
    });

    const originalPriceWithMarkup =
      e.price.originalPrice +
      e.price.originalPrice * 0.15 +
      (e.price.originalPrice * aggregateMarkup.rate +
        aggregateMarkup.fixed * exchangeRate);

    const currentPriceWithMarkup =
      e.price.currentPrice +
      e.price.currentPrice * aggregateMarkup.rate +
      aggregateMarkup.fixed * exchangeRate;

    // console.log('Orjinal Fiyat:', e.price.originalPrice);
    // console.log('Toplam Markup Oranı:', aggregateMarkup.rate);
    // console.log('Toplam Sabit Markup:', aggregateMarkup.fixed);
    // console.log('Döviz Kuru:', exchangeRate);
    // console.log('Rate değeri:',e.price.originalPrice * aggregateMarkup.rate, 'Fixed değeri:', aggregateMarkup.fixed * exchangeRate);
    // console.log('Toplam Markup:', e.price.originalPrice * aggregateMarkup.rate + aggregateMarkup.fixed * exchangeRate);
    // console.log('Markup eklenmiş fiyat:',e.price.originalPrice +(e.price.originalPrice * aggregateMarkup.rate + aggregateMarkup.fixed * exchangeRate) );
    // console.log('Markup eklenmiş orjinal fiyat:', originalPriceWithMarkup);

    return {
      ...e,
      price: {
        currency: e.price.currency,
        currentPrice: currentPriceWithMarkup,
        originalPrice: originalPriceWithMarkup,
      },
    };
  });
};

const normalizeProductPrices = <T extends ProductLike>(products: T[]): T[] => {
  let strategy: (val: number) => number;
  if (products[0].price.currency === "UZS")
    strategy = (val: number) => Math.ceil(val / 1000) * 1000;
  else strategy = (val: number) => val - (val % 1) + 0.99;
  return products.map((e) => ({
    ...e,
    price: {
      currency: e.price.currency,
      currentPrice: strategy(e.price.currentPrice),
      originalPrice: strategy(e.price.originalPrice),
    },
  }));
};

type FixedPriceEntry = {
  productId: string | number;
  price: ShopProductPrice;
};

const applyFixedPrices = async <T extends ProductLike>(
  products: T[],
  region: Region
) => {
  try {
    const [fixedPrices] = await bring<FixedPriceEntry[]>("/api/cms/shop-fixed-prices", {
      params: { region },
    });
    if (!fixedPrices.length) return products;
    products = products.map((e) => {
      const fixedPrice = fixedPrices.find(
        (entry) => e.id.toString() === entry.productId.toString()
      )?.price;
      if (!fixedPrice) return e;
      return {
        ...e,
        price: fixedPrice,
      };
    });
    return products;
  } catch (error) {
    console.error("Error applying fixed prices:", error);
    return products;
  }
};

export const convertProductPrices = async <T extends ProductLike>(
  products: T[],
  region: Region
): Promise<T[]> => {
  if (!products.length) return products;

  products = await markupProductPrices(products, region);

  const currency = getCurrencyForCountry(region.toUpperCase() as Country);

  const fromCurrency = currency;
  const toCurrency = products[0].price.currency;
  const exchangeRate = await getExchangeRate({
    from: fromCurrency,
    to: toCurrency,
  });

  if (!exchangeRate) throw new Error("Exchange rate not available");

  products = products.map((e) => ({
    ...e,
    price: {
      currency,
      currentPrice: e.price.currentPrice / exchangeRate,
      originalPrice: e.price.originalPrice / exchangeRate,
    },
  }));

  products = normalizeProductPrices(products);

  products = await applyFixedPrices(products, region);

  return products;
};

export const convertProductPrice = async <T extends ProductLike>(
  product: T,
  region: Region
): Promise<T> => (await convertProductPrices([product], region))[0];

/* REGION: UTILITIES */

export const normalizePriceRanges = (
  priceRange: number[],
  currency: Currency
): number[] => {
  let strategy: (val: number) => number;
  if (currency === "UZS")
    strategy = (val: number) => Math.floor(val / 10000) * 10000;
  else strategy = (val: number) => val - (val % 1) + 0.99;
  return priceRange.map((e) => strategy(e));
};

/* ENDREGION: UTILITIES */
