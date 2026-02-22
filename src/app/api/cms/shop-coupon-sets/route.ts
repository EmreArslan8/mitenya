import bring, { type StrapiCollectionResult } from '@/lib/api/bring';
import type { ShopCouponSetData } from '@/lib/api/types';
import { CMS_CONFIG_ERROR, CMS_INTERNAL_ERROR, getFirstAttributes } from '../_shared';

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const revalidate = 60;

export const GET = async () => {
  if (!cmsApiUrl || !cmsBearer) {
    return Response.json(CMS_CONFIG_ERROR, { status: 500 });
  }

  const [res, error] = await bring<StrapiCollectionResult<ShopCouponSetData>>(
    `${cmsApiUrl}/shop-coupon-sets`,
    {
      params: {
        publicationState: 'live',
        populate: 'deep,4',
        'pagination[pageSize]': 1,
        sort: 'publishedAt:desc',
      },
      headers: { Authorization: `Bearer ${cmsBearer}` },
      static: true,
    }
  );

  if (error) {
    return Response.json(CMS_INTERNAL_ERROR, { status: 500 });
  }

  const attributes = getFirstAttributes(res);
  if (!attributes) {
    return Response.json({ coupons: [] }, { status: 200 });
  }

  const { coupons = [] } = attributes;

  return Response.json({ coupons });
};
