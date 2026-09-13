import { describe, expect, it } from 'vitest';
import imageLoader, { buildImageSrcSet, canResizeImage } from './imageLoader';

describe('imageLoader', () => {
  it('Cloudflare kaynaginda istenen genisligi URLye uygular', () => {
    expect(
      imageLoader({ src: 'https://cdn.mitenya.com/products/serum/main.webp', width: 640 }),
    ).toBe(
      'https://cdn.mitenya.com/cdn-cgi/image/width=640,format=auto/products/serum/main.webp',
    );
  });

  it('Cloudinary kaynaginda format, kalite ve genislik donusumu uretir', () => {
    expect(
      imageLoader({
        src: 'https://res.cloudinary.com/mitenya/image/upload/v1/banner.jpg',
        width: 1080,
        quality: 82,
      }),
    ).toBe(
      'https://res.cloudinary.com/mitenya/image/upload/f_auto,q_82,c_limit,w_1080/v1/banner.jpg',
    );
  });

  it('DPR secimi icin farkli genislik adaylari yazar', () => {
    expect(
      buildImageSrcSet('https://cdn.mitenya.com/products/serum/main.webp', [320, 640]),
    ).toContain('width=320,format=auto/products/serum/main.webp 320w');
    expect(
      buildImageSrcSet('https://cdn.mitenya.com/products/serum/main.webp', [320, 640]),
    ).toContain('width=640,format=auto/products/serum/main.webp 640w');
  });

  it('SVG ve boyutlandirma desteklemeyen origin icin sahte srcset uretmez', () => {
    expect(canResizeImage('https://cdn.mitenya.com/logo.svg')).toBe(false);
    expect(buildImageSrcSet('http://localhost:1337/uploads/banner.webp', [320, 640])).toBeUndefined();
  });
});
