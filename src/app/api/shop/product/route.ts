import { NextResponse } from 'next/server';

export const maxDuration = 60;

export const GET = async () => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
};

export const dynamic = 'force-dynamic';

/*

import { Locale } from '@/i18n';
import { bring }from '@/lib/api/bring';
import {
  ShopProductData,
  ShopProductPrice,
  ShopProductReview,
  ShopProductVariantData,
} from '@/lib/api/types';
import { Region } from '@/lib/shop/regions';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { BFMProductData } from '../utils/bfmTypes';
import { isBannedProduct } from '../utils/blacklist';
import { convertProductPrice } from '../utils/pricing/convertProductPrices';
import { decrypt, decryptNum, encrypt, encryptNum } from '../utils/crypto';
import translate from '../utils/translate';
import {
  translateProductAttributes,
  translateProductDescription,
  translateProductName,
} from '../utils/translateProductNames';
import { translateProductReviews } from './helpers';

const bfmBaseUrl = process.env.NEXT_PUBLIC_BFM_API_URL;
const guestEndpoint = `${bfmBaseUrl}/v1/guest/extract`;
const userEndpoint = `${bfmBaseUrl}/v1/extract`;

export const maxDuration = 60;

export const GET = async (req: NextRequest) => {
  // #SHUTDOWN
  return NextResponse.json({ error: 'Service is under maintenance' }, { status: 503 });
  // const { idToken } = (await getServerSession(authOptions)) ?? {};
  // const searchParams = req.nextUrl.searchParams;
  // const id = searchParams.get('id');
  // const locale = searchParams.get('locale') as Locale;
  // const region = searchParams.get('region') as Region;
  // const rawDescriptionOnly = searchParams.get('rawDescriptionOnly') === 'true';
  // if (!id || (!rawDescriptionOnly && (!locale || !region)))
  //   return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  // if (isBannedProduct({ id })) return NextResponse.json({ error: 'Bad Request' }, { status: 400 });

  // const productUrl = getProductUrl(id);
  // let sourceLocale: Locale = 'tr';
  // if (productUrl.includes('zara')) sourceLocale = 'en';

  // const endpoint = idToken ? userEndpoint : guestEndpoint;
  // let config = {
  //   params: { url: productUrl },
  //   method: 'POST',
  //   revalidate: 60,
  //   ...(idToken ? { headers: { Authorization: idToken } } : {}),
  // };

  // const [res] = await bring(endpoint, config);

  // let {
  //   url,
  //   src,
  //   website,
  //   currency,
  //   breadcrumbs: rawBreadcrumbs,
  //   sizeRecommendation,
  //   originalPrice,
  //   reviews,
  //   variants,
  //   ...bfmProductData
  // } = res.productData as BFMProductData;

  // variants = variants?.map((v) => ({
  //   ...v,
  //   options: v.options.map((o) => ({ ...o, ...(o.id && { id: encryptNum(o.id).toString() }) })),
  // }));

  // let product: ShopProductData = {
  //   ...bfmProductData,
  //   variants,
  //   id,
  //   src: src ? encrypt(src) : undefined,
  //   url: `/product/${id}`,
  //   price: {
  //     currentPrice: bfmProductData.price!,
  //     originalPrice: originalPrice!,
  //     currency: currency!,
  //   },
  // };

  // if (rawDescriptionOnly) return NextResponse.json({ ...product, price: null });

  // let translatedName: string = '';
  // let translatedDescription: string | undefined;
  // let translatedAttributes: { name: string; value: string }[] | undefined;
  // let translatedReviews: ShopProductReview[] | undefined;
  // let convertedPrice: ShopProductPrice = product.price;
  // let translatedSizeRecommendation: string | undefined;
  // // let breadcrumbs: ShopProductBreadcrumb[] | undefined;

  // await Promise.allSettled([
  //   translateProductName(product, locale, sourceLocale).then((e) => (translatedName = e)),
  //   translateProductDescription(product, locale).then((e) => (translatedDescription = e)),
  //   translateProductAttributes(product, locale).then((e) => (translatedAttributes = e)),
  //   convertProductPrice({ ...product, breadcrumbs: rawBreadcrumbs }, region).then((e) => {
  //     convertedPrice = e.price;
  //     // convertedVariants = e.variants;
  //   }),
  //   sizeRecommendation &&
  //     translate([sizeRecommendation], locale).then(
  //       (res) => (translatedSizeRecommendation = res[0])
  //     ),
  //   reviews && translateProductReviews(reviews, locale).then((e) => (translatedReviews = e)),
  //   // transformBreadcrumbs(rawBreadcrumbs, locale).then((e) => (breadcrumbs = e)),
  // ]);

  // product = {
  //   ...product,
  //   name: translatedName,
  //   description: translatedDescription,
  //   attributes: translatedAttributes,
  //   reviews: translatedReviews,
  //   sizeRecommendation: translatedSizeRecommendation,
  //   price: convertedPrice,
  //   // variants: convertedVariants,
  //   // breadcrumbs,
  // };

  // return NextResponse.json({ ...product, id } as ShopProductData);
};

const getProductUrl = (id: string) => {
  let productUrl: string;

  const isTouchePriveId = id.startsWith('toucheprive-');
  if (isTouchePriveId) {
    productUrl = `https://toucheprive.com/products/${id.replace('toucheprive-', '')}`;
    return productUrl;
  }

  const isHmId = id.startsWith('hm-');
  if (isHmId) {
    productUrl = `https://www2.hm.com/tr_tr/productpage.${decryptNum(id.split('-')[1])
      .toString()
      .padStart(10, '0')}.html`;
    return productUrl;
  }

  const isHiccupId = id.startsWith('hiccup');
  if (isHiccupId) {
    const [, pid, skuPrefix] = id.split('-');
    productUrl = `https://hiccup.com/product/${pid}`;
    if (skuPrefix) productUrl += `?skuPrefix=${skuPrefix}`;

    return productUrl;
  }

  const isTrendyolmillaId = id.startsWith('trendyolmilla');
  if (isTrendyolmillaId) {
    const sections = id.split('-');
    const pid = decryptNum(sections[1]);
    const mid = sections[1] ? decryptNum(sections[2]) : null;
    productUrl = `https://trendyol-milla.com/p-${pid}`;
    if (mid) productUrl += `?merchantId=${mid}`;
    return productUrl;
  }

  const isZaraId = id.startsWith('zara');
  if (isZaraId) {
    const sections = id.split('-');
    const pid = decryptNum(sections[1]);
    productUrl = `https://www.zara.com/?v1=${pid}`;
    return productUrl;
  }

  const isTrendyolId = !isNaN(parseInt(id));
  if (isTrendyolId) {
    const sections = id.split('-');
    const pid = decryptNum(sections[0]);
    const mid = sections[1] ? decryptNum(sections[1]) : null;
    const vid = sections[2] ? decryptNum(sections[2]) : null;
    productUrl = `https://trendyol.com/p-${pid}?`;
    // if (mid) productUrl += `&merchantId=${mid}`;
    if (vid) productUrl += `&itemNumber=${vid}`;
  } else productUrl = decrypt(id);

  return productUrl;
};

export const dynamic = 'force-dynamic';

*/
