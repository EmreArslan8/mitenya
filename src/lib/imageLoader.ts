/**
 * next/image icin ozel loader (uc dalli).
 *
 * Amac: goruntu boyutlandirmayi Next'in kendi optimizer'ina degil, zaten
 * onde duran CDN'lere yaptirmak. Next hicbir byte'a dokunmaz, yalnizca
 * <img srcset sizes> markup'ini yazar; sharp'a da gerek kalmaz.
 *
 *   1. cdn.mitenya.com  -> Cloudflare Image Resizing (/cdn-cgi/image/...)
 *   2. res.cloudinary.com -> Cloudinary transform (f_auto,q_auto:eco,c_limit)
 *   3. digerleri (yerel /static, Strapi) -> dokunulmadan gecer
 */

const CLOUDINARY_UPLOAD = '/image/upload/';
const CF_RESIZE_PREFIX = '/cdn-cgi/image/';

/** `v1788306630` gibi Cloudinary surum segmenti. */
const VERSION_SEGMENT = /^v\d+$/;

type LoaderArgs = { src: string; width: number; quality?: number };

const isSvg = (src: string) => src.split('?')[0].toLowerCase().endsWith('.svg');

/**
 * Cloudflare Image Resizing URL'i kurar.
 *
 * Kritik: kaynak ZATEN `/cdn-cgi/image/width=480,.../products/...` seklinde
 * sarilmis gelebiliyor (shopProductMapper boyle uretiyor). Ustune bir kez daha
 * sarmak `/cdn-cgi/image/.../cdn-cgi/image/...` uretir ve Cloudflare bunu
 * origin yolu sanip `err=9404` ile 404 doner. Bu yuzden varsa mevcut donusum
 * soyulup yenisi kuruluyor.
 */
export const buildCloudflareUrl = ({ src, width, quality }: LoaderArgs): string => {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (isSvg(url.pathname)) return src;

  let path = url.pathname;
  if (path.startsWith(CF_RESIZE_PREFIX)) {
    // `/cdn-cgi/image/<opsiyonlar>/<gercek yol>` -> `<gercek yol>`
    const afterPrefix = path.slice(CF_RESIZE_PREFIX.length);
    const firstSlash = afterPrefix.indexOf('/');
    if (firstSlash === -1) return src;
    path = afterPrefix.slice(firstSlash);
  }

  const transforms = [`width=${width}`, 'format=auto'];
  if (typeof quality === 'number') transforms.push(`quality=${quality}`);

  return `${url.origin}${CF_RESIZE_PREFIX}${transforms.join(',')}${path}`;
};

export const buildCloudinaryUrl = ({ src, width, quality }: LoaderArgs): string => {
  const uploadIndex = src.indexOf(CLOUDINARY_UPLOAD);
  if (uploadIndex === -1) return src;

  // SVG'ye f_auto uygulanirsa Cloudinary onu raster'a cevirir; marka logolari
  // bulaniklasir. Vektorler dokunulmadan gecer.
  if (isSvg(src)) return src;

  const prefix = src.slice(0, uploadIndex + CLOUDINARY_UPLOAD.length);
  const rest = src.slice(uploadIndex + CLOUDINARY_UPLOAD.length);
  const segments = rest.split('/');

  // Ilk segment surum degilse zaten bir donusum var (or. `f_auto,w_768`);
  // ust uste bindirmek yerine onu degistiriyoruz.
  const hasTransform = segments.length > 1 && !VERSION_SEGMENT.test(segments[0]);
  const tail = hasTransform ? segments.slice(1).join('/') : rest;

  // c_limit sart: `sizes` vermeyen bilesenlerde next/image en buyuk device
  // size'i (3840w) secebiliyor; c_limit olmadan Cloudinary gorseli buyutur ve
  // 16 KB'lik bir logo 190 KB'a cikar.
  //
  // q_auto:eco sabit q_75'ten iyi: hero'da ayni (53.7 KB) ama duz renkli
  // logolarda 33.9 KB -> 13.7 KB. Bilesen acikca `quality` verirse ona uyulur.
  const q = quality ? `q_${quality}` : 'q_auto:eco';

  return `${prefix}f_auto,${q},c_limit,w_${width}/${tail}`;
};

const imageLoader = (args: LoaderArgs): string => {
  if (args.src.includes('res.cloudinary.com')) return buildCloudinaryUrl(args);
  if (args.src.includes('cdn.mitenya.com')) return buildCloudflareUrl(args);

  return args.src;
};

export default imageLoader;
