// src/lib/utils/r2.ts
const DEFAULT_IMAGE_FORMAT = 'auto';

const getR2BaseUrl = () => process.env.NEXT_PUBLIC_R2_BASE_URL?.replace(/\/$/, '') ?? '';

export function r2Url(pathOrUrl: string) {
  if (!pathOrUrl) return '';

  const base = getR2BaseUrl();

  // base yoksa dokunma (picsum vb. full URL'ler için)
  if (!base) {
    console.warn('⚠ NEXT_PUBLIC_R2_BASE_URL not set, returning raw path/url');
    return pathOrUrl;
  }

  // Eğer zaten http ile başlıyorsa (eski full URL kayıtları) hiç dokunma:
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const cleanPath = pathOrUrl.replace(/^\/+/, '');

  return `${base}/${cleanPath}`;
}

type R2ImageOptions = {
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'json';
};

type R2ImageProfile = {
  widths: number[];
  sizes: string;
  quality?: number;
  format?: R2ImageOptions['format'];
};

export const R2_IMAGE_PROFILES = {
  productCard: {
    widths: [240, 360, 480, 768],
    sizes: '(max-width: 600px) 50vw, (max-width: 900px) 33vw, 300px',
    format: 'auto',
  },
} satisfies Record<string, R2ImageProfile>;

export function r2ImageUrl(
  pathOrUrl: string,
  { width, quality, format = DEFAULT_IMAGE_FORMAT }: R2ImageOptions = {}
) {
  const source = r2Url(pathOrUrl);
  if (!source) return '';

  const url = new URL(source);
  const base = getR2BaseUrl();

  if (!base || url.origin !== base) {
    return source;
  }

  const transforms = [`format=${format}`];
  if (typeof quality === 'number') transforms.push(`quality=${quality}`);
  if (width) transforms.unshift(`width=${width}`);

  return `${url.origin}/cdn-cgi/image/${transforms.join(',')}${url.pathname}`;
}

export function r2ImageSrcSet(
  pathOrUrl: string,
  widths: number[],
  options?: Omit<R2ImageOptions, 'width'>
) {
  return widths
    .map((width) => `${r2ImageUrl(pathOrUrl, { ...options, width })} ${width}w`)
    .join(', ');
}
