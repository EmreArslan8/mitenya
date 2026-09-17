import { brandTag, productTag } from '@/lib/cache/tags';

type ProductRecord = {
  slug?: string | null;
  id?: string | number | null;
  brand_id?: string | null;
};

/**
 * Kabul edilen body formatları:
 *  1) Supabase Database Webhook: { type, table, record, old_record }
 *  2) Manuel/test: { slug, id, brand_id }
 */
export type RevalidatePayload = ProductRecord & {
  record?: ProductRecord | null;
  old_record?: ProductRecord | null;
};

/**
 * Webhook payload'ından düşürülecek cache etiketlerini çıkarır.
 *
 * - Ürün sayfası: slug ve id (PDP ikisiyle de cache'lenebilir).
 * - Marka sayfası (ADR-0003): brand_id. old_record da taranır; ürünün slug'ı ya
 *   da markası değiştiyse ESKİ sayfa da yenilenmeli, yoksa ürün orada asılı kalır.
 */
export const collectRevalidateTags = (
  body: RevalidatePayload,
  querySlug?: string | null
): string[] => {
  const tags = new Set<string>();

  const collect = (record?: ProductRecord | null) => {
    if (!record) return;
    if (record.slug) tags.add(productTag(record.slug));
    if (record.id != null) tags.add(productTag(String(record.id)));
    if (record.brand_id) tags.add(brandTag(record.brand_id));
  };

  collect(body.record);
  collect(body.old_record);
  collect(body);
  if (querySlug) tags.add(productTag(querySlug));

  return [...tags];
};
