import bring, { type StrapiCollectionResult } from '@/lib/api/bring';
import { type CMSProductPdpData } from '@/lib/api/cms';
import { type CMSBlock } from '@/components/cms/blocks';
import { CMS_CONFIG_ERROR, CMS_INTERNAL_ERROR, getFirstAttributes } from '../_shared';
import { NextRequest } from 'next/server';

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const revalidate = 60;

export const GET = async (req: NextRequest) => {
  const slug = req.nextUrl.searchParams.get('slug');

  if (!cmsApiUrl || !cmsBearer) {
    console.error('[product-pdp] Missing environment variables:', {
      NEXT_PUBLIC_STRAPI_URL: cmsApiUrl,
      STRAPI_BEARER: cmsBearer,
    });
    return Response.json(CMS_CONFIG_ERROR, { status: 500 });
  }

  if (!slug) {
    return Response.json({ blocks: [] satisfies CMSBlock[] }, { status: 200 });
  }

  try {
    const [data, error] = await bring<StrapiCollectionResult<{ blocks?: unknown[] }>>(
      `${cmsApiUrl}/products`,
      {
        params: {
          publicationState: 'live',
          'pagination[pageSize]': 1,
          'filters[slug][$eq]': slug,
          populate: 'deep,5',
        },
        headers: { Authorization: `Bearer ${cmsBearer}` },
        static: true,
      }
    );

    if (error) {
      console.error('[product-pdp] bring error:', error);
      return Response.json(CMS_INTERNAL_ERROR, { status: 500 });
    }

    const attributes = getFirstAttributes(data);
    const blocks = Array.isArray(attributes?.blocks)
      ? (attributes.blocks as CMSBlock[])
      : [];

    return Response.json({ blocks } satisfies CMSProductPdpData, { status: 200 });
  } catch (err) {
    console.error('[product-pdp] Unexpected error:', err);
    return Response.json(CMS_INTERNAL_ERROR, { status: 500 });
  }
};
