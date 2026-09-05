import { NextRequest, NextResponse } from 'next/server';
import { compressedJson } from '@/lib/api/compressedJson';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const userIp = getClientIp(req);
  if (!(await rateLimit(`blog_list:${userIp}`))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!strapiUrl || !cmsBearer) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const limit = req.nextUrl.searchParams.get('limit') || '10';

  try {
    const res = await fetch(
      `${strapiUrl}/blogs?sort=publishedAt:desc&pagination[limit]=${limit}&populate[cover]=*&publicationState=live`,
      {
        headers: {
          Authorization: `Bearer ${cmsBearer}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: res.status });
    }

    const json = await res.json();
    return compressedJson(req, json);
  } catch (err) {
    console.error('Blog list fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
