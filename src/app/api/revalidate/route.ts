import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

/**
 * ADR-0001: On-demand revalidation. Ürün Supabase'de değişince DB webhook bu ucu
 * çağırır ve sadece o ürünün ISR cache'i (`product:<slug>`) düşürülür → sonraki
 * istekte taze üretilir. Fiyat/stok saniyeler içinde güncellenir; revalidate=300
 * yalnızca güvenlik ağıdır.
 *
 * Kabul edilen body formatları:
 *  1) Supabase Database Webhook (otomatik):
 *     { type, table, record: { slug, id }, old_record: { slug } }
 *     → record.slug (+ slug değiştiyse old_record.slug) ve id revalidate edilir.
 *  2) Manuel/test: { "slug": "...", "id": 123 }  veya  ?slug=...
 *
 * Kurulum:
 *  - Coolify env: REVALIDATE_SECRET=<güçlü-rastgele-değer>
 *  - Supabase → Database → Webhooks → yeni webhook:
 *      Table: products | Events: INSERT, UPDATE, DELETE
 *      Type: HTTP Request, Method: POST
 *      URL: https://mitenya.com/api/revalidate
 *      HTTP Headers: x-revalidate-secret: <REVALIDATE_SECRET>
 */
type SupabaseWebhookPayload = {
  record?: { slug?: string; id?: string | number } | null;
  old_record?: { slug?: string; id?: string | number } | null;
  slug?: string;
  id?: string | number;
};

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

  let body: SupabaseWebhookPayload = {};
  try {
    body = await req.json();
  } catch {
    // Body opsiyonel; slug query'den de gelebilir.
  }

  // Supabase webhook (record/old_record) + düz body + query — hepsini topla.
  const slugs = new Set<string>();
  const ids = new Set<string>();

  const collect = (slug?: string, id?: string | number) => {
    if (slug) slugs.add(slug);
    if (id != null) ids.add(String(id));
  };

  collect(body.record?.slug, body.record?.id);
  collect(body.old_record?.slug, body.old_record?.id); // slug değişmişse eski sayfa da
  collect(body.slug, body.id);
  collect(req.nextUrl.searchParams.get('slug') ?? undefined);

  // getProductData hem slug hem id ile cache'lenebildiği için ikisinin de tag'ini düşür.
  const tags = [
    ...[...slugs].map((s) => `product:${s}`),
    ...[...ids].map((i) => `product:${i}`),
  ];

  if (tags.length === 0) {
    return Response.json({ error: 'slug or id required' }, { status: 400 });
  }

  tags.forEach((tag) => revalidateTag(tag));

  return Response.json({ revalidated: true, tags, now: Date.now() });
};
