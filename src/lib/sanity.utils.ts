// src/lib/sanity.utils.ts
import type { Image } from 'sanity';
import { urlFor } from './sanity.image';

export type ImageLike = string | Image | null | undefined;

type Options = {
  width?: number;
  height?: number;
  fit?: 'max' | 'min' | 'crop' | 'fill' | 'clip' | 'scale';
  quality?: number; // 1-100
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  fallback?: string;
};

export function getImageUrl(
  source: ImageLike,
  {
    width = 800,
    height = 600,
    fit = 'crop',
    quality = 80,
    format = 'auto',
    fallback = '/static/images/placeholders/default.webp',
  }: Options = {}
): string {
  if (!source) return fallback;

  // Raw string URL geldiyse direkt dön
  if (typeof source === 'string') return source;

  try {
    // Sanity image objesi (asset ref) için builder zinciri
    let builder = urlFor(source).width(width).height(height).fit(fit).quality(quality);
    if (format !== 'auto') builder = builder.format(format);
    else builder = builder.auto('format');

    return builder.url();
  } catch {
    return fallback;
  }
}
