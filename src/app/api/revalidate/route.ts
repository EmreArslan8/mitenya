import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

type SanitySlug = { current?: string } | string | null | undefined;
type RevalidatePayload = {
  _type?: string;
  slug?: SanitySlug;
  previousSlug?: SanitySlug;
};

function getSlugValue(slug: SanitySlug): string | null {
  if (!slug) return null;
  if (typeof slug === 'string') return slug;
  return slug.current ?? null;
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: 'Invalid secret' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const data = (body ?? {}) as RevalidatePayload;
  const docType = data._type ?? null;
  const slug = getSlugValue(data.slug) ?? getSlugValue(data.previousSlug);

  // her durumda listeyi yenile
  revalidatePath('/products');

  // ürün detayını da yenile
  if (docType === 'product' && slug) {
    revalidatePath(`/products/${slug}`);
  }

  return NextResponse.json({ ok: true, type: docType, slug });
}
