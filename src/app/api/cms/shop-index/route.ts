import bring, { type StrapiCollectionResult } from '@/lib/api/bring';
import { NextRequest } from 'next/server';
import { CMS_CONFIG_ERROR, CMS_INTERNAL_ERROR, getFirstAttributes } from '../_shared';
import { CMSPageData } from '@/lib/api/cms';

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const revalidate = 60;

export const GET = async (req: NextRequest) => {
  const slug = req.nextUrl.searchParams.get('slug');

  if (!cmsApiUrl || !cmsBearer) {
    console.error('[shop-index] Missing environment variables:', {
      NEXT_PUBLIC_STRAPI_URL: cmsApiUrl,
      STRAPI_BEARER: cmsBearer,
    });
    return Response.json(CMS_CONFIG_ERROR, { status: 500 });
  }

  const params: Record<string, string | number | boolean> = {
    publicationState: 'live',
    'pagination[pageSize]': 1,
    populate: 'deep,5',
  };

  if (slug) {
    params['filters[slug][$eq]'] = slug;
  } else {
    params['filters[slug][$null]'] = true;
  }

  try {
    const [data, error] = await bring<StrapiCollectionResult<CMSPageData>>(
      `${cmsApiUrl}/shops`,
      {
        params,
        headers: { Authorization: `Bearer ${cmsBearer}` },
      }
    );

    if (error) {
      console.error('[shop-index] bring error:', error);
      return Response.json(CMS_INTERNAL_ERROR, { status: 500 });
    }

    const attributes = getFirstAttributes(data);
    if (!attributes) {
      return Response.json(
        { message: 'Not Found - No attributes in response' },
        { status: 404 }
      );
    }

    const { title, blocks, gap } = attributes;
    return Response.json({ title, blocks, gap }, { status: 200 });
  } catch (err) {
    console.error('[shop-index] Unexpected error:', err);
    return Response.json(CMS_INTERNAL_ERROR, { status: 500 });
  }
};
