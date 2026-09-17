import type { BrandContent, BrandTiming } from '@/lib/api/cmsBrand';
import type { BrandProduct } from '@/lib/api/supabaseBrand';

export const TIMING_LABELS: Record<BrandTiming, string> = {
  sabah: 'Sabah',
  aksam: 'Akşam',
  sabah_aksam: 'Sabah · Akşam',
};

export type BrandProductView = BrandProduct & { note?: string };

export type RoutineStepView = {
  title: string;
  timing: string;
  products: BrandProduct[];
  fallback?: { label: string; url: string };
};

/** Strapi ürün notlarını ürünlere slug ile bağlar; notu olmayan ürün açıklamasız kalır. */
export const attachProductNotes = (
  products: BrandProduct[],
  notes: BrandContent['productNotes']
): BrandProductView[] => {
  const bySlug = new Map(notes.map((item) => [item.productSlug.trim(), item.note]));
  return products.map((product) => ({ ...product, note: bySlug.get(product.slug) }));
};

const splitSlugs = (value?: string | null) =>
  (value ?? '')
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);

/**
 * Rutin adımlarını ürünlerle eşleştirir. Slug'ı artık satılmayan bir ürüne
 * işaret eden adım "bu markada yok" durumuna düşer; ne ürünü ne fallback linki
 * olan adım gösterilmez (boş kart üretmez).
 */
export const buildRoutineSteps = (
  routine: BrandContent['routine'],
  products: BrandProduct[]
): RoutineStepView[] => {
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return routine
    .map((step) => ({
      title: step.title,
      timing: TIMING_LABELS[step.timing] ?? '',
      products: splitSlugs(step.productSlugs)
        .map((slug) => bySlug.get(slug))
        .filter((product): product is BrandProduct => Boolean(product)),
      fallback:
        step.fallbackLabel && step.fallbackUrl
          ? { label: step.fallbackLabel, url: step.fallbackUrl }
          : undefined,
    }))
    .filter((step) => step.products.length > 0 || step.fallback);
};

/** Düz metni paragraflara böler (boş satır = yeni paragraf). */
export const toParagraphs = (text?: string | null) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/** Strapi'de içerik yokken kullanılan, uydurma bilgi içermeyen açıklama. */
export const fallbackIntro = (brandName: string, productCount: number) =>
  `${brandName} markasının ${productCount} ürünü mitenya'da.`;
