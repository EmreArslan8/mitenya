import type { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_HOST_URL ?? 'https://mitenya.com').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth',
          '/cart',
          '/checkout',
          '/orders',
          '/settings',
          '/payment',
          '/success',
          '/search',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
