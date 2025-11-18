import { fetchProductData } from '@/lib/api/shop';
import isSSR from '@/lib/utils/isSSR';
import ProductPageView from './view';
import { ShopProductData } from '@/lib/api/types';

const SuspensedView = async ({
  params: { id },
}: {
  params: { id: string; };
}) => {
  const data = await fetchProductData(id);
  if (!data) throw new Error(`error.products.details: ${id}`);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getProductJsonLd(data) }}
      />
      {!isSSR() && <title>{`${data?.brand ?? ''} ${data?.name ?? ''} | Bringist`}</title>}
      <ProductPageView data={data} />
    </>
  );
};

export const getProductJsonLd = (product: ShopProductData): string => {
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.imgSrc,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price.currentPrice,
      priceCurrency: product.price.currency,
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        name: 'originalPrice',
        price: product.price.originalPrice,
        priceCurrency: product.price.currency,
      },
    },
  };

  return JSON.stringify(jsonLd, null, 2);
};

export default SuspensedView;
