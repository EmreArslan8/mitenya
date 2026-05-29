import { fetchProductPdpBlocks, fetchShopCouponSet } from '@/lib/api/cms';
import ProductPageView from './view';
import { notFound } from 'next/navigation';
import JsonLdScript from '@/components/SEO/JsonLdScript';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildProductJsonLd } from '@/lib/seo/productJsonLd';
import { mapProductToPdpViewData } from '@/lib/shop/productGallery';
import { ShopProductData } from '@/lib/api/types';
import ProductPdpBlocks from './components/ProductPdpBlocks';
import { getProductData } from './data';
import { resolveInitialGalleryIsDesktop } from './galleryViewport';

const SuspensedView = async ({
  params,
  initialData,
}: {
  params: { id: string };
  initialData?: ShopProductData | null;
}) => {
  const id = params.id;
  const initialGalleryIsDesktop = await resolveInitialGalleryIsDesktop();

  const data = initialData ?? await getProductData(id);

  if (!data) {
    notFound();
  }
  const pdpSlug = data.url.split('/product/')[1] ?? id;
  const [pdpBlocks, couponSet] = await Promise.all([
    fetchProductPdpBlocks(pdpSlug),
    fetchShopCouponSet(),
  ]);
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
        coupons={couponSet?.coupons ?? []}
        initialGalleryIsDesktop={initialGalleryIsDesktop}
        pdpBlocksSlot={pdpBlocks?.length ? <ProductPdpBlocks blocks={pdpBlocks} /> : undefined}
      />
    </>
  );
};

export default SuspensedView;
