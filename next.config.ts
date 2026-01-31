/** @type {import('next').NextConfig} */
const nextConfig = {
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
              "https://pub-0f1b6b5801ac4f70a86a2ec4b0f72bbe.r2.dev",
            ]
              .filter(Boolean)
              .join(' ');

            return {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                imgSrc,
                "font-src 'self' data: https://fonts.gstatic.com",
                "connect-src 'self' https://*.supabase.co https://www.paytr.com https://www.google-analytics.com https://challenges.cloudflare.com",
                "frame-src https://www.paytr.com https://challenges.cloudflare.com",
                "frame-ancestors 'self'",
                "form-action 'self'",
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
    ],
  },
};

module.exports = nextConfig;
