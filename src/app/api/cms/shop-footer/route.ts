import bring, { type StrapiCollectionResult } from '@/lib/api/bring';
import type { ShopFooterData } from '@/lib/api/types';
import { CMS_CONFIG_ERROR, CMS_INTERNAL_ERROR, getFirstAttributes } from '../_shared';

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const revalidate = 60;

export const GET = async () => {
  if (!cmsApiUrl || !cmsBearer) {
    return Response.json(CMS_CONFIG_ERROR, { status: 500 });
  }

  const [res, error] = await bring<StrapiCollectionResult<ShopFooterData>>(
    `${cmsApiUrl}/shop-footers`,
    {
      params: {
        publicationState: 'live',
        populate: 'deep,4',
        'pagination[pageSize]': 1,
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
    return Response.json({ links: [], socials: [], vendors: { data: [] } }, { status: 200 });
  }
  const { links, socials, address, vendors } = attributes;

  return Response.json({ links, socials, address, vendors });
};
