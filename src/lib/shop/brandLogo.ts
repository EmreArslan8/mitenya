/**
 * Marka logolarını tek şeritte dengeli göstermek için boyut hesabı.
 *
 * Sorun: logoların en/boy oranları çok farklı (A313 3.4:1 kompakt, Beauty of
 * Joseon 10.6:1 uzun). Hepsine aynı yüksekliği verirsen kompakt olan devleşir,
 * aynı genişliği verirsen tam tersi olur.
 *
 * Çözüm iki katmanlı:
 *   1) Yükseklik, logonun oranından türetilir — logo uzadıkça kısalır.
 *      Oran zaten Strapi'den geliyor (image.width / image.height), elle
 *      girmeye gerek yok.
 *   2) Çizgi kalınlığı için marka bazlı düzeltme. Kalın bir wordmark aynı
 *      boydaki ince bir wordmark'tan daha ağır görünür; bunu matematik
 *      bilemez, gözle ayarlanır.
 */

/**
 * Denge sertliği.
 *   0    → hepsi eşit yükseklik (kompakt logolar devleşir)
 *   0.5  → hepsi eşit alan (uzun logolar aşırı ezilir)
 *   0.35 → pratikte en dengeli nokta
 */
const RATIO_EXPONENT = 0.35;

/** Referans orandaki bir logonun kutu yüksekliğini doldurma oranı */
const BASE_FILL = 0.85;

/**
 * Referans oran — setteki en kompakt logo (A313, 3.37:1). Sabit tutuluyor ki
 * CMS'e yeni bir marka eklendiğinde mevcut logoların boyu kaymasın.
 */
const REFERENCE_RATIO = 3.37;

/** Şeritteki ortak kutu yüksekliği (px) */
export const BRAND_BOX_HEIGHT = 48;
export const BRAND_BOX_HEIGHT_HIGHLIGHT = 60;

/**
 * Çizgi kalınlığı düzeltmeleri. Anahtar: logonun adı/alt metni, normalize
 * edilmiş hâlde. Listede olmayan marka 1 alır — yani düzeltme uygulanmaz,
 * sadece orana bağlı denge çalışır. Yeni marka eklenince buraya bir satır
 * eklemek zorunlu değil, sadece göze ağır/hafif geliyorsa gerekir.
 */
const WEIGHT_SCALE: Record<string, number> = {
  a313: 0.9, // kalın grotesk (w2 inceltilmiş varyantla birlikte)
  celimax: 0.88, // kalın geometrik sans
  'mary-may': 1.08, // kıl gibi ince
  numbuzin: 0.96,
  'beauty-of-joseon': 1.06, // ince didone, uzun
};

/**
 * "Mary & May" → "mary-may", "A313 Logo" → "a313".
 * Strapi'deki alternativeText genelde sonuna "logo/logosu" alıyor, onu at.
 */
export const brandKey = (name: string): string =>
  name
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-?(logosu|logo)$/, '')
    .replace(/^-|-$/g, '');

/**
 * Bir logonun şeritteki piksel yüksekliği.
 * @param boxHeight ortak kutu yüksekliği
 * @param width kaynak görselin genişliği (Strapi)
 * @param height kaynak görselin yüksekliği (Strapi)
 * @param name marka adı — kalınlık düzeltmesini bulmak için
 */
export const brandLogoHeight = (
  boxHeight: number,
  width: number,
  height: number,
  name?: string,
): number => {
  // Bozuk/eksik CMS verisinde kutuyu doldurmaya çalışmak yerine güvenli tarafta kal
  if (!width || !height) return boxHeight * BASE_FILL;

  const ratio = width / height;
  const fill = BASE_FILL * Math.pow(REFERENCE_RATIO / ratio, RATIO_EXPONENT);
  const scale = (name && WEIGHT_SCALE[brandKey(name)]) || 1;

  // Kutudan taşmasın
  return Math.min(boxHeight, boxHeight * fill * scale);
};
