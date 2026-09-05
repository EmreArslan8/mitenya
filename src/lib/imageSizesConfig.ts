/**
 * next/image aday havuzunun TEK kaynagi.
 *
 * Hem `next.config.ts` hem de PDP'deki `preload(...)` bu degerleri kullanir.
 * Ikisi ayri yerlerde tanimlanirsa preload bir adayi, galeri baska bir adayi
 * indirir ve LCP gorseli IKI kez inmis olur.
 */

/** Akiskan (vw tabanli) gorseller icin. 2048/3840 yok: orijinaller ~2000px. */
export const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920];

/**
 * `sizes` verilen gorseller icin ek adaylar.
 * 1280: PDP ana gorseli masaustunde 640px slota denk geliyor, DPR 2'de tam
 * 1280 gerekiyor; listede olmazsa tarayici 1920'ye atlar.
 */
export const IMAGE_SIZES = [96, 128, 192, 240, 256, 320, 384, 480, 1280];

/** Next 16'dan itibaren zorunlu. PDP gorselleri 82 kullaniyor. */
export const QUALITIES = [75, 82];

const ALL_SIZES = [...DEVICE_SIZES, ...IMAGE_SIZES].sort((a, b) => a - b);

/**
 * next/image'in `getWidths` fonksiyonundaki `sizes` dalinin birebir kopyasi
 * (next/dist/shared/lib/get-img-props.js). `sizes` icinde vw varsa en kucuk
 * vw orani esik olur; yoksa tum liste kullanilir.
 */
export const getNextImageWidths = (sizes: string): number[] => {
  const vwMatches = [...sizes.matchAll(/(^|\s)(1?\d?\d)vw/g)].map((m) => Number(m[2]));
  if (!vwMatches.length) return ALL_SIZES;

  const smallestRatio = Math.min(...vwMatches) * 0.01;
  return ALL_SIZES.filter((s) => s >= DEVICE_SIZES[0] * smallestRatio);
};
