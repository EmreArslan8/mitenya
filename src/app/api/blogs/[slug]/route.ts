import { NextResponse } from 'next/server';

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  if (!strapiUrl) return NextResponse.json({ error: 'STRAPI_URL missing' }, { status: 500 });

  try {
    const res = await fetch(
      `${strapiUrl}/blogs?filters[slug][$eq]=${params.slug}&populate[cover]=*`,
      { next: { revalidate: 3600 } }
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
