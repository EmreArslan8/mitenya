/**
 * Marka son ekini temizler.
 *
 * `layout.tsx` başlık şablonu zaten `%s | Mitenya` ekliyor. CMS'te metaTitle
 * alanına da "| Mitenya" yazılırsa başlık iki kez markalanıyor
 * ("... | Mitenya | Mitenya"). Kuralı editöre bırakmak yerine burada
 * uyguluyoruz: CMS ne yazarsa yazsın çıktı tek marka eki taşır.
 */
const BRAND_SUFFIX = /[\s]*[|\-–—][\s]*mitenya[\s]*$/i;

export const stripBrandSuffix = (value: string): string => {
  let result = value.trim();
  // Art arda yazılmış olabilir ("X | Mitenya | Mitenya").
  while (BRAND_SUFFIX.test(result)) result = result.replace(BRAND_SUFFIX, '').trim();
  return result || value.trim();
};
