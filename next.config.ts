import type { NextConfig } from 'next';
import { DEVICE_SIZES, IMAGE_SIZES, QUALITIES } from './src/lib/imageSizesConfig';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: process.env.MITENYA_SOURCE_MAPS === 'true',
  /**
   * GÜVENLİK UYARISI: Bu ayarlar geçici olarak aktif.
   * Production öncesi tüm TypeScript ve ESLint hatalarının düzeltilmesi önerilir.
   * Hatalar güvenlik açıklarını gizleyebilir!
   *
   * TODO: Bu ignore'ları kaldırıp tüm hataları düzeltin:
   * - npx tsc --noEmit
   * - npm run lint
   */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/public/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/siparis-takip',
        destination: '/order-status',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)'
          },
          (() => {
            const isDev = process.env.NODE_ENV !== 'production';
            const imgSrc = [
              "img-src 'self' data: https: blob:",
              isDev ? "http://localhost:1337" : null,
              "https://cdn.mitenya.com",
            ]
              .filter(Boolean)
              .join(' ');

            return {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://analytics.tiktok.com https://ads.tiktok.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                imgSrc + " https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://analytics.tiktok.com https://ads.tiktok.com",
                "font-src 'self' data: https://fonts.gstatic.com",
                "connect-src 'self' https://*.supabase.co https://www.paytr.com https://www.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://challenges.cloudflare.com https://connect.facebook.net https://www.facebook.com https://analytics.tiktok.com https://ads.tiktok.com https://*.ecs.us-east-2.on.aws https://*.run.app",
                "frame-src https://www.paytr.com https://challenges.cloudflare.com https://www.googletagmanager.com https://www.facebook.com https://analytics.tiktok.com https://ads.tiktok.com",
                "frame-ancestors 'self'",
                "form-action 'self' https://www.facebook.com",
                "base-uri 'self'",
                "object-src 'none'"
              ].join('; ')
            };
          })()
        ]
      }
    ];
  },
  images: {
    // `unoptimized: true` KAPALI (deneme). Bunun yerine src/lib/imageLoader.ts
    // Cloudflare / Cloudinary donusumlerini kuruyor; Next hicbir goruntuyu
    // kendisi islemiyor, yalnizca srcset/sizes markup'ini yaziyor.
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    // Aday havuzu src/lib/imageSizesConfig.ts'ten geliyor; PDP preload'u da
    // ayni kaynagi kullaniyor ki preload ile galeri farkli aday indirmesin.
    deviceSizes: DEVICE_SIZES,
    imageSizes: IMAGE_SIZES,
    qualities: QUALITIES,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: "https",
        hostname: "funny-animal-09dc5ed329.media.strapiapp.com", 
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "funny-animal-09dc5ed329.strapiapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "funny-animal-09dc5ed329.media.strapiapp.com", 
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "genuine-blessing-adf56ff856.strapiapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "genuine-blessing-adf56ff856.media.strapiapp.com",
        pathname: "/**",
      },
            
      {
        protocol: "https",
        hostname: "kozmedo-cms.onrender.com",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.mitenya.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = async () => {
  if (process.env.ANALYZE !== 'true') return nextConfig;

  const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
    enabled: true,
  });

  return withBundleAnalyzer(nextConfig);
};
