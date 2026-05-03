import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { fetchProductPdpBlocks, fetchShopCouponSet } from '@/lib/api/cms';
import ProductPageView from './view';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import JsonLdScript from '@/components/SEO/JsonLdScript';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildProductJsonLd } from '@/lib/seo/productJsonLd';
import { mapProductToPdpViewData } from '@/lib/shop/productGallery';
import ProductAboveFold from './components/ProductAboveFold';

// Ürün verisi 1 saat cache'lenir. Fiyat/stok client-side live endpoint'ten alınır.
// Module level'da tanımlanır — her çağrıda yeni wrapper oluşmasını engeller.
const getCachedProductData = unstable_cache(
  async (id: string) => fetchProductDataSupabase(id),
  ['product-data'],
  { revalidate: 3600 }
);

const SuspensedView = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const data = await getCachedProductData(id);

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
      <ProductAboveFold data={viewData} />
      <ProductPageView
        data={viewData}
        coupons={couponSet?.coupons ?? []}
        pdpBlocks={pdpBlocks ?? []}
      />
    </>
  );
};

export default SuspensedView;
