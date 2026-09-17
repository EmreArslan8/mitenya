import type { BrandProduct } from '@/lib/api/supabaseBrand';
import { brandPath } from '@/lib/shop/brandPath';

const baseUrl = (process.env.NEXT_PUBLIC_HOST_URL ?? 'https://mitenya.com').replace(/\/$/, '');

const toAbsoluteUrl = (path: string) =>
  path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

type BrandJsonLdInput = {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  products: BrandProduct[];
};

/**
 * Marka sayfası yapılandırılmış verisi (ADR-0003): Brand + ItemList + BreadcrumbList.
 *
 * FAQPage bilinçli olarak yok — Google 2023'ten beri çoğu sitede göstermiyor.
 * `<` kaçırılır: CMS metni `</script>` içerirse script etiketini kapatamasın.
 */
export const buildBrandJsonLd = ({ name, slug, description, logoUrl, products }: BrandJsonLdInput): string => {
  const url = toAbsoluteUrl(brandPath(slug));

  const graph = [
    {
      '@type': 'Brand',
      '@id': `${url}#brand`,
      name,
      url,
      ...(description ? { description } : {}),
      ...(logoUrl ? { logo: toAbsoluteUrl(logoUrl) } : {}),
    },
    {
      '@type': 'ItemList',
      name: `${name} ürünleri`,
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: toAbsoluteUrl(product.url),
        name: product.name,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
};
