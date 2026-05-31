import { Suspense } from 'react';
import { fetchProductPdpBlocks, fetchShopCouponSet } from '@/lib/api/cms';
import ProductPageView from './view';
import { notFound } from 'next/navigation';
import JsonLdScript from '@/components/SEO/JsonLdScript';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildProductJsonLd } from '@/lib/seo/productJsonLd';
import { mapProductToPdpViewData } from '@/lib/shop/productGallery';
import { ShopProductData } from '@/lib/api/types';
import ProductPdpBlocks from './components/ProductPdpBlocks';
import WelcomeCouponModal from '@/components/WelcomeCouponModal';
import { getProductData } from './data';
import { resolveInitialGalleryIsDesktop } from './galleryViewport';

const PdpBlocksSlot = async ({ slug }: { slug: string }) => {
  const pdpBlocks = await fetchProductPdpBlocks(slug);
  return pdpBlocks?.length ? <ProductPdpBlocks blocks={pdpBlocks} /> : null;
};

const WelcomeCouponSlot = async () => {
  const couponSet = await fetchShopCouponSet();
  return <WelcomeCouponModal coupons={couponSet?.coupons ?? []} placement="product" />;
};

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
        initialGalleryIsDesktop={initialGalleryIsDesktop}
        couponSlot={
          <Suspense fallback={null}>
            <WelcomeCouponSlot />
          </Suspense>
        }
        pdpBlocksSlot={
          <Suspense fallback={null}>
            <PdpBlocksSlot slug={pdpSlug} />
          </Suspense>
        }
      />
    </>
  );
};

export default SuspensedView;
