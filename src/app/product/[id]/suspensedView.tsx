import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { fetchProductPdpBlocks, fetchShopCouponSet } from '@/lib/api/cms';
import ProductPageView from './view';
import { notFound } from 'next/navigation';
import JsonLdScript from '@/components/SEO/JsonLdScript';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildProductJsonLd } from '@/lib/seo/productJsonLd';
import ProductPdpBlocks from './components/ProductPdpBlocks';

const SuspensedView = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  const data = await fetchProductDataSupabase(id);

  if (!data) {
    notFound();
  }
  const pdpSlug = data.url.split('/product/')[1] ?? id;
  const [pdpBlocks, couponSet] = await Promise.all([
    fetchProductPdpBlocks(pdpSlug),
    fetchShopCouponSet(),
  ]);
  const productJsonLd = buildProductJsonLd(data);
  const faqJsonLd = buildFaqJsonLd(data);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(data);

  return (
    <>
      <JsonLdScript json={productJsonLd} />
      {faqJsonLd && <JsonLdScript json={faqJsonLd} />}
      <JsonLdScript json={breadcrumbJsonLd} />
      <ProductPageView
        data={data}
        coupons={couponSet?.coupons ?? []}
        pdpBlocksSlot={pdpBlocks?.length ? <ProductPdpBlocks blocks={pdpBlocks} /> : undefined}
      />
    </>
  );
};

export default SuspensedView;
