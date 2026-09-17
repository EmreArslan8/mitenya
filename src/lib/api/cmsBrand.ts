import 'server-only';
import type { SharedImageType } from '@/components/cms/shared/cmsTypes';
import { ALL_BRAND_CONTENT_TAG, brandContentTag } from '../cache/tags';
import bring, { type StrapiCollectionResult } from './bring';

/**
 * Marka sayfasının Strapi içeriği (ADR-0003). Doğrudan Strapi'ye gider
 * (ADR-0001: self-fetch yok) ve `brand-content:<slug>` etiketiyle cache'lenir;
 * Strapi webhook'u bu etiketi düşürür.
 */

export const BRAND_CONTENT_REVALIDATE_SECONDS = 3600;

export type BrandTiming = 'sabah' | 'aksam' | 'sabah_aksam';

export type BrandContent = {
  name: string;
  slug: string;
  logo?: SharedImageType | null;
  tagline?: string | null;
  intro?: string | null;
  about?: string | null;
  facts: Array<{ label: string; value: string }>;
  productNotes: Array<{ productSlug: string; note: string }>;
  ingredients: Array<{ eyebrow?: string | null; title: string; description?: string | null }>;
  comparison?: {
    title: string;
    subtitle?: string | null;
    columnA: string;
    columnB: string;
    columnC?: string | null;
    rows: Array<{ label: string; valueA: string; valueB: string; valueC?: string | null }>;
  } | null;
  routine: Array<{
    title: string;
    timing: BrandTiming;
    productSlugs?: string | null;
    fallbackLabel?: string | null;
    fallbackUrl?: string | null;
  }>;
  faqs: Array<{ title: string; description?: string | null }>;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalURL?: string | null;
    metaRobots?: string | null;
  } | null;
  blogs: Array<{
    title: string;
    slug: string;
    excerpt?: string | null;
    publishDate?: string | null;
    cover?: SharedImageType | null;
  }>;
};

type StrapiRelation<T> = { data?: Array<{ attributes?: T }> | null };

type BrandContentResponse = Omit<BrandContent, 'blogs' | 'facts' | 'productNotes' | 'ingredients' | 'routine' | 'faqs'> &
  Partial<Pick<BrandContent, 'facts' | 'productNotes' | 'ingredients' | 'routine' | 'faqs'>> & {
    blogs?: StrapiRelation<BrandContent['blogs'][number]>;
  };

// Açık populate: `deep` plugin'i yerine sadece sayfanın kullandığı alanlar (daha küçük yanıt).
const BRAND_CONTENT_PARAMS = {
  'filters[slug][$eq]': '',
  publicationState: 'live',
  'pagination[pageSize]': 1,
  'populate[logo]': '*',
  'populate[facts]': '*',
  'populate[productNotes]': '*',
  'populate[ingredients]': '*',
  'populate[comparison][populate]': 'rows',
  'populate[routine]': '*',
  'populate[faqs]': '*',
  'populate[seo]': '*',
  'populate[blogs][fields][0]': 'title',
  'populate[blogs][fields][1]': 'slug',
  'populate[blogs][fields][2]': 'excerpt',
  'populate[blogs][fields][3]': 'publishDate',
  'populate[blogs][populate]': 'cover',
  'populate[blogs][filters][publishedAt][$notNull]': 'true',
  'populate[blogs][sort]': 'publishDate:desc',
} as const;

export const normalizeBrandContent = (raw: BrandContentResponse): BrandContent => ({
  ...raw,
  facts: raw.facts ?? [],
  productNotes: raw.productNotes ?? [],
  ingredients: raw.ingredients ?? [],
  routine: raw.routine ?? [],
  // Cevabı girilmemiş soru yayınlanmaz: boş cevap ince içerik üretir.
  faqs: (raw.faqs ?? []).filter((faq) => Boolean(faq.description?.trim())),
  blogs: (raw.blogs?.data ?? [])
    .map((item) => item.attributes)
    .filter((blog): blog is BrandContent['blogs'][number] => Boolean(blog?.slug)),
});

/**
 * Markanın Strapi içeriği; kayıt yoksa `null` (sayfa yine üretilir ama noindex alır).
 *
 * Strapi erişilemezse fırlatır: boş sonuç cache'lenip sayfa bir saat boyunca
 * içeriksiz ve noindex kalmasın, Next eski sayfayı servis etmeye devam etsin.
 */
export const fetchBrandContent = async (slug: string): Promise<BrandContent | null> => {
  const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const cmsBearer = process.env.STRAPI_BEARER;
  if (!cmsApiUrl || !cmsBearer) return null;

  const [res, error] = await bring<StrapiCollectionResult<BrandContentResponse>>(
    `${cmsApiUrl}/brands`,
    {
      params: { ...BRAND_CONTENT_PARAMS, 'filters[slug][$eq]': slug },
      headers: { Authorization: `Bearer ${cmsBearer}` },
      static: true,
      next: { revalidate: BRAND_CONTENT_REVALIDATE_SECONDS, tags: [brandContentTag(slug), ALL_BRAND_CONTENT_TAG] },
    }
  );

  if (error) {
    throw new Error(`fetchBrandContent(${slug}) failed: ${error.message}`);
  }

  const attributes = res?.data?.[0]?.attributes;
  return attributes ? normalizeBrandContent(attributes) : null;
};

/**
 * Yayında olan marka içeriklerinin slug'ları (sitemap). Sitemap bir marka yüzünden
 * düşmesin diye hata durumunda boş döner — blog slug'larıyla aynı davranış.
 */
export const fetchBrandContentSlugs = async (): Promise<string[]> => {
  const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const cmsBearer = process.env.STRAPI_BEARER;
  if (!cmsApiUrl || !cmsBearer) return [];

  const [res, error] = await bring<StrapiCollectionResult<{ slug?: string }>>(`${cmsApiUrl}/brands`, {
    params: { 'fields[0]': 'slug', publicationState: 'live', 'pagination[pageSize]': 100 },
    headers: { Authorization: `Bearer ${cmsBearer}` },
    static: true,
    next: { revalidate: BRAND_CONTENT_REVALIDATE_SECONDS, tags: [ALL_BRAND_CONTENT_TAG] },
  });
  if (error) return [];

  return (res?.data ?? []).map((item) => item.attributes?.slug).filter((slug): slug is string => Boolean(slug));
};
