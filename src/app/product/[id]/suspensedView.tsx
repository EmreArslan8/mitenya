import { fetchProductData } from '@/lib/api/shop';
import ProductPageView from './view';
import { ShopProductData } from '@/lib/api/types';

type Props = {
  params: { slug: string };
};

const SuspensedView = async ({ params: { slug } }: Props) => {
  // Ürünü getir
  const data = await fetchProductData(slug);
  if (!data) throw new Error(`Ürün bulunamadı: ${slug}`);

  return (
    <>
      {/* SEO Structured Data (Google Rich Snippet) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getProductJsonLd(data) }}
      />

      <title>{`${data?.brand ?? ''} ${data?.title ?? ''} | Kozmedo`}</title>

      {/* Sayfa View bileşeni */}
      <ProductPageView data={data} />
    </>
  );
};

export const getProductJsonLd = (product: ShopProductData): string => {
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.imgSrc,
    description: product.shortDesc || '',
    brand: {
      '@type': 'Brand',
      name: product.brand || '',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.currentPrice,
      priceCurrency: product.price.currency,
      availability: 'https://schema.org/InStock',
    },
  };

  return JSON.stringify(jsonLd, null, 2);
};

export default SuspensedView;
