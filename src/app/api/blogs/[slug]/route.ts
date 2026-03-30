import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Rate limiting
  const userIp = getClientIp(req);
  if (!(await rateLimit(`blog_detail:${userIp}`))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  if (!strapiUrl || !cmsBearer) return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });

  try {
    const res = await fetch(
      `${strapiUrl}/blogs?filters[slug][$eq]=${slug}&populate[cover]=*&populate[seo]=*&publicationState=live`,
      {
        headers: {
          Authorization: `Bearer ${cmsBearer}`,
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch blog' }, { status: res.status });
    }
    const json = await res.json();
    const blog = json?.data?.[0] ?? null;
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (err) {
    console.error('Blog fetch error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
