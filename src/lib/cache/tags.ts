/**
 * Next data cache etiketleri — TEK kaynak (ADR-0001, ADR-0003).
 *
 * Etiketi üreten (`unstable_cache`) ve düşüren (`/api/revalidate`) taraf aynı
 * fonksiyonu kullanmak ZORUNDA; string elle yazılırsa iki taraf sessizce ayrışır
 * ve sayfa bir daha tazelenmez.
 */

/** Ürün detay sayfası. Hem slug hem id ile cache'lenebildiği için ikisi de kullanılır. */
export const productTag = (idOrSlug: string) => `product:${idOrSlug}`;

/** Marka sayfasının Supabase ürün listesi. Anahtar brand_id: webhook payload'ında slug yok. */
export const brandTag = (brandId: string) => `brand:${brandId}`;

/** Marka sayfasının Strapi içeriği. Strapi webhook'u slug gönderir. */
export const brandContentTag = (slug: string) => `brand-content:${slug}`;
