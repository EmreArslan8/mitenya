import ProductPageView from './view';
import { notFound } from 'next/navigation';
import JsonLdScript from '@/components/SEO/JsonLdScript';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildProductJsonLd } from '@/lib/seo/productJsonLd';
import { mapProductToPdpViewData } from '@/lib/shop/productGallery';
import { ShopProductData } from '@/lib/api/types';
import ProductPdpBlocksClient from './components/ProductPdpBlocksClient';
import WelcomeCouponClient from './components/WelcomeCouponClient';
import { getProductData } from './data';

// ADR-0001: CMS blokları ve kupon artık client'tan yükleniyor (sunucu self-fetch
// yok), böylece sayfa kabuğu ISR olabiliyor. JSON-LD (fiyat/availability dahil) ve
// ürün gövdesi SSR'lı kalır — SEO ve CLS korunur.

const SuspensedView = async ({
  params,
  initialData,
}: {
  params: { id: string };
  initialData?: ShopProductData | null;
}) => {
  const id = params.id;
  const data = initialData ?? await getProductData(id);

  if (!data) {
    notFound();
  }
  const pdpSlug = data.url.split('/product/')[1] ?? id;
  const viewData = mapProductToPdpViewData(data);
  const productJsonLd = buildProductJsonLd(data);
  const faqJsonLd = buildFaqJsonLd(data);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(data);

  return (
    <>
      <JsonLdScript json={productJsonLd} />
      {faqJsonLd && <JsonLdScript json={faqJsonLd} />}
      <JsonLdScript json={breadcrumbJsonLd} />
      <ProductPageView
        data={viewData}
        couponSlot={<WelcomeCouponClient placement="product" />}
        pdpBlocksSlot={<ProductPdpBlocksClient slug={pdpSlug} />}
      />
    </>
  );
};

export default SuspensedView;
