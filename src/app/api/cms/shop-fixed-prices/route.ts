import bring, { type StrapiCollectionResult } from '@/lib/api/bring';
import type { ShopFixedPricesData } from '@/lib/api/types';
import { CMS_CONFIG_ERROR, CMS_INTERNAL_ERROR, getFirstAttributes } from '../_shared';

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const revalidate = 60;

export const GET = async () => {
  if (!cmsApiUrl || !cmsBearer) {
    return Response.json(CMS_CONFIG_ERROR, { status: 500 });
  }

  const url = `${cmsApiUrl}/shop-fixed-prices`;

  const params: Record<string, string | number | boolean> = {
    publicationState: 'live',
    'pagination[pageSize]': 1,
    populate: 'deep,4',
    sort: 'publishedAt:desc',
  };

  try {
    const [data, error] = await bring<StrapiCollectionResult<ShopFixedPricesData>>(url, {
      params,
      headers: { Authorization: `Bearer ${cmsBearer}` },
      static: true,
    });

    if (error) {
      console.error('[shop-fixed-prices] bring error:', error);
      return Response.json(CMS_INTERNAL_ERROR, { status: 500 });
    }

    const attributes = getFirstAttributes(data);
    const fixedPrices = attributes?.fixedPrices ?? [];

    return Response.json(fixedPrices, { status: 200 });
  } catch (error) {
    console.error('[shop-fixed-prices] Unexpected error:', error);
    return Response.json(CMS_INTERNAL_ERROR, { status: 500 });
  }
};
