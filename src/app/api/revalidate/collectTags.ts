import { ALL_BRAND_CONTENT_TAG, brandContentTag, brandTag, productTag } from '@/lib/cache/tags';

type ProductRecord = {
  slug?: string | null;
  id?: string | number | null;
  brand_id?: string | null;
};

/**
 * Kabul edilen body formatları:
 *  1) Supabase Database Webhook: { type, table, record, old_record }
 *  2) Strapi webhook: { event, model, entry }
 *  3) Manuel/test: { slug, id, brand_id }
 */
export type RevalidatePayload = ProductRecord & {
  record?: ProductRecord | null;
  old_record?: ProductRecord | null;
  model?: string;
  entry?: { slug?: string | null } | null;
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

  // Strapi (ADR-0003): marka kaydı → o markanın içeriği; blog → tüm marka sayfaları
  // (blog payload'ı ilişkili markaları içermez).
  if (body.model === 'brand' && body.entry?.slug) tags.add(brandContentTag(body.entry.slug));
  if (body.model === 'blog') tags.add(ALL_BRAND_CONTENT_TAG);

  collect(body.record);
  collect(body.old_record);
  collect(body);
  if (querySlug) tags.add(productTag(querySlug));

  return [...tags];
};
