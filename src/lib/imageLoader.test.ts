import { describe, expect, it } from 'vitest';
import imageLoader, { buildCloudinaryGifVideoUrl, buildImageSrcSet, canResizeImage } from './imageLoader';

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

describe('buildCloudinaryGifVideoUrl', () => {
  it('Cloudinary GIF kaynagini istenen formatta videoya cevirir', () => {
    expect(
      buildCloudinaryGifVideoUrl(
        'https://res.cloudinary.com/mitenya/image/upload/v1/info-areas/zarf.gif',
        'mp4',
        384,
      ),
    ).toBe('https://res.cloudinary.com/mitenya/image/upload/f_mp4,q_auto:eco,c_limit,w_384/v1/info-areas/zarf.mp4');
  });

  it('kaynaktaki mevcut donusumu degistirir', () => {
    expect(
      buildCloudinaryGifVideoUrl(
        'https://res.cloudinary.com/mitenya/image/upload/f_auto,w_768/v1/zarf.gif',
        'webm',
        384,
      ),
    ).toBe('https://res.cloudinary.com/mitenya/image/upload/f_webm,q_auto:eco,c_limit,w_384/v1/zarf.webm');
  });

  it('GIF olmayan ya da Cloudinary disi kaynakta undefined doner', () => {
    expect(
      buildCloudinaryGifVideoUrl('https://res.cloudinary.com/mitenya/image/upload/v1/zarf.webp', 'mp4', 384),
    ).toBeUndefined();
    expect(buildCloudinaryGifVideoUrl('http://localhost:1337/uploads/zarf.gif', 'mp4', 384)).toBeUndefined();
  });
});
