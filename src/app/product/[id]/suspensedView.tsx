import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { fetchProductPdpBlocks, fetchShopCouponSet } from '@/lib/api/cms';
import ProductPageView from './view';
import { notFound } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import JsonLdScript from '@/components/SEO/JsonLdScript';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildProductJsonLd } from '@/lib/seo/productJsonLd';
import { mapProductToPdpViewData } from '@/lib/shop/productGallery';
import ProductPdpBlocks from './components/ProductPdpBlocks';

// Ürün verisi 1 saat cache'lenir. Fiyat/stok client-side live endpoint'ten alınır.
// Module level'da tanımlanır — her çağrıda yeni wrapper oluşmasını engeller.
const getCachedProductData = unstable_cache(
  async (id: string) => fetchProductDataSupabase(id),
  ['product-data'],
  { revalidate: 3600 }
);

const GALLERY_VIEWPORT_COOKIE = 'gallery_viewport';
const MOBILE_USER_AGENT_PATTERN =
  /Android.+Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

const getInitialGalleryMode = ({
  viewportCookie,
  viewportWidthHint,
  mobileHint,
  userAgent,
}: {
  viewportCookie?: string;
  viewportWidthHint?: string;
  mobileHint?: string;
  userAgent: string;
}) => {
  if (viewportCookie === 'desktop') return true;
  if (viewportCookie === 'mobile') return false;

  const hintedViewportWidth = Number.parseInt(viewportWidthHint ?? '', 10);
  if (Number.isFinite(hintedViewportWidth)) {
    return hintedViewportWidth >= 600;
  }

  if (mobileHint === '?1') return false;
  if (mobileHint === '?0') return true;

  return !MOBILE_USER_AGENT_PATTERN.test(userAgent);
};

const SuspensedView = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const userAgent = requestHeaders.get('user-agent') ?? '';
  const viewportCookie = cookieStore.get(GALLERY_VIEWPORT_COOKIE)?.value;
  const viewportWidthHint = requestHeaders.get('sec-ch-viewport-width') ?? undefined;
  const mobileHint = requestHeaders.get('sec-ch-ua-mobile') ?? undefined;
  const initialGalleryIsDesktop = getInitialGalleryMode({
    viewportCookie,
    viewportWidthHint,
    mobileHint,
    userAgent,
  });

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
