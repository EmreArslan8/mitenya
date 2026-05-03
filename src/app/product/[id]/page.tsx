import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { PRODUCT_PDP_MOBILE_IMAGE_PROFILE } from '@/lib/shop/productPdpImageProfile';
import { r2ImageSrcSet, r2ImageUrl } from '@/lib/utils/r2';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import Loading from './loading';
import SuspensedView from './suspensedView';

export const revalidate = 3600;

// suspensedView ile aynı cache — Supabase'e tek seferinde gidilir
const getCachedProductData = unstable_cache(
  async (id: string) => fetchProductDataSupabase(id),
  ['product-data'],
  { revalidate: 3600 }
);

const ProductPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  // LCP fotoğrafını Suspense çözülmeden preload et.
  const r2Base = process.env.NEXT_PUBLIC_R2_BASE_URL;
  const data = await getCachedProductData(id);
  const lcpPath = data?.images?.[0] ?? data?.imgSrc;
  const lcpProfile = PRODUCT_PDP_MOBILE_IMAGE_PROFILE;
  const lcpSrc = r2Base && lcpPath
    ? r2ImageUrl(lcpPath, {
        width: lcpProfile.widths[1],
        quality: lcpProfile.quality,
        format: lcpProfile.format,
      })
    : null;
  const lcpSrcSet = r2Base && lcpPath
    ? r2ImageSrcSet(lcpPath, lcpProfile.widths, {
        quality: lcpProfile.quality,
        format: lcpProfile.format,
      })
    : null;

  return (
    <>
      {lcpSrc && (
        <link
          rel="preload"
          as="image"
          href={lcpSrc}
          fetchPriority="high"
          // @ts-expect-error — imageSrcSet/imageSizes preload attr'lari React tiplerinde eksik olabilir.
          imageSrcSet={lcpSrcSet}
          imageSizes={lcpProfile.sizes}
        />
      )}
      <Suspense fallback={<Loading />} key={id}>
        <SuspensedView params={{ id }} />
      </Suspense>
    </>
  );
};

export const maxDuration = 30;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;

  const data = await getCachedProductData(id);

  const fullName = `${data?.brand ?? ''} ${data?.name ?? ''}`.trim();
  const defaultDescription = `${fullName} - Orijinal Kore kozmetik ürünü. En uygun fiyat ve hızlı kargo ile Mitenya'da.`;

  const title = data?.metaTitle || `${fullName} | Mitenya`;
  const description = data?.metaDescription || defaultDescription;
  const canonical = data?.url || `/product/${id}`;

  return {
    title: { absolute: title },
    description,
    keywords: data?.metaKeywords?.split(',').map((k: string) => k.trim()),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [
        {
          url: data?.imgSrc ?? '/static/images/ogBanner.webp',
          alt: fullName,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

// Ürün verisi suspensedView içinde unstable_cache ile 1 saat cache'leniyor.

export default ProductPage;
