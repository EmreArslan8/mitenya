import 'server-only';
import bring, { type StrapiCollectionResult } from './bring';
import type { ShopHeaderData, ShopFooterData } from './types';

/**
 * ADR-0001: (shop) layout header/footer'ı eskiden kendi /api/cms route'umuza HTTP
 * atarak çekiyordu (bring('/api/cms/shop-header') → 127.0.0.1 self-fetch). Build'de
 * sunucu olmadığı için ECONNREFUSED veriyor, layout'u kullanan TÜM sayfaları (PDP
 * dahil) ISR'dan alıkoyuyordu.
 *
 * Bu modül aynı veriyi DOĞRUDAN Strapi'den çeker (route handler'larıyla aynı sorgu).
 * next.revalidate ile cache'lenir → ISR çalışır, ekstra HTTP hop kalkar.
 *
 * Not: /api/cms/shop-header ve shop-footer route'ları client çağrıları için DURUYOR;
 * bu fonksiyonlar yalnızca sunucu render yolunda (layout) kullanılır.
 */

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

const COLLECTION_PARAMS = {
  publicationState: 'live',
  populate: 'deep,4',
  'pagination[pageSize]': 1,
} as const;

const firstAttributes = <T>(res: StrapiCollectionResult<T> | null): T | undefined =>
  res?.data?.[0]?.attributes;

export const getShopHeaderDirect = async (): Promise<ShopHeaderData | undefined> => {
  if (!cmsApiUrl || !cmsBearer) return undefined;
  try {
    const [res, error] = await bring<StrapiCollectionResult<ShopHeaderData>>(
      `${cmsApiUrl}/shop-headers`,
      {
        params: COLLECTION_PARAMS,
        headers: { Authorization: `Bearer ${cmsBearer}` },
        static: true,
        next: { revalidate: 300 },
      }
    );
    if (error) return undefined;
    const a = firstAttributes(res);
    if (!a) return undefined;
    const { links, bannerLinks, categories } = a;
    return { links, bannerLinks, categories } as ShopHeaderData;
  } catch {
    return undefined;
  }
};

export const getShopFooterDirect = async (): Promise<ShopFooterData | undefined> => {
  if (!cmsApiUrl || !cmsBearer) return undefined;
  try {
    const [res, error] = await bring<StrapiCollectionResult<ShopFooterData>>(
      `${cmsApiUrl}/shop-footers`,
      {
        params: COLLECTION_PARAMS,
        headers: { Authorization: `Bearer ${cmsBearer}` },
        static: true,
        next: { revalidate: 300 },
      }
    );
    if (error) return undefined;
    const a = firstAttributes(res);
    if (!a) return undefined;
    const { links, socials, address, vendors } = a;
    return { links, socials, address, vendors } as ShopFooterData;
  } catch {
    return undefined;
  }
};
