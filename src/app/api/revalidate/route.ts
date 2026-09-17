import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';
import { collectRevalidateTags, type RevalidatePayload } from './collectTags';

/**
 * ADR-0001 / ADR-0003: On-demand revalidation. Ürün Supabase'de değişince DB webhook
 * bu ucu çağırır; o ürünün sayfası (`product:<slug|id>`) ve markasının sayfası
 * (`brand:<brand_id>`) düşürülür → sonraki istekte taze üretilir. Sayfalardaki
 * `revalidate` değerleri yalnızca güvenlik ağıdır.
 *
 * Body formatları ve hangi etiketlerin düşürüldüğü: ./collectTags.ts
 * Ek olarak `?slug=...` query'si de kabul edilir.
 *
 * Kurulum:
 *  - Coolify env: REVALIDATE_SECRET=<güçlü-rastgele-değer>
 *  - Supabase → Database → Webhooks → yeni webhook:
 *      Table: products | Events: INSERT, UPDATE, DELETE
 *      Type: HTTP Request, Method: POST
 *      URL: https://mitenya.com/api/revalidate
 *      HTTP Headers: x-revalidate-secret: <REVALIDATE_SECRET>
 *  - Strapi → Settings → Webhooks (ADR-0003, marka içeriği):
 *      URL: https://mitenya.com/api/revalidate
 *      Headers: x-revalidate-secret: <REVALIDATE_SECRET>
 *      Events: Entry create/update/delete/publish/unpublish (brand + blog için)
 */
export const POST = async (req: NextRequest) => {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ error: 'REVALIDATE_SECRET not configured' }, { status: 500 });
  }

  const provided =
    req.headers.get('x-revalidate-secret') ?? req.nextUrl.searchParams.get('secret');
  if (provided !== secret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: RevalidatePayload = {};
  try {
    body = await req.json();
  } catch {
    // Body opsiyonel; slug query'den de gelebilir.
  }

  const tags = collectRevalidateTags(body, req.nextUrl.searchParams.get('slug'));

  if (tags.length === 0) {
    return Response.json({ error: 'slug, id or brand_id required' }, { status: 400 });
  }

  tags.forEach((tag) => revalidateTag(tag));

  return Response.json({ revalidated: true, tags, now: Date.now() });
};
