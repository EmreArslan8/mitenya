import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import isPreviewBot from '@/lib/utils/isPreviewBot';
import isSSR from '@/lib/utils/isSSR';
import { r2ImageSrcSet, r2ImageUrl } from '@/lib/utils/r2';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import Loading from './loading';
import SuspensedView from './suspensedView';

// suspensedView ile aynı cache — Supabase'e tek seferinde gidilir
const getCachedProductData = unstable_cache(
  async (id: string) => fetchProductDataSupabase(id),
  ['product-data'],
  { revalidate: 3600 }
);

const ProductPage = async ({ params }: { params: { id: string } }) => {
  if (await isPreviewBot()) return <></>;

  const { id } = await params;

  // LCP fotoğrafını Suspense çözülmeden preload et.
  // Slug → image path pattern tutarlı olduğu için spekülatif olarak eklenebilir.
  const r2Base = process.env.NEXT_PUBLIC_R2_BASE_URL;
  const lcpPath = `products/${id}/main.webp`;
  const lcpSrc = r2Base ? r2ImageUrl(lcpPath, { width: 960, quality: 82, format: 'auto' }) : null;
  const lcpSrcSet = r2Base ? r2ImageSrcSet(lcpPath, [720, 960, 1200], { quality: 82, format: 'auto' }) : null;

  return (
    <>
      {lcpSrc && (
        <link
          rel="preload"
          as="image"
          href={lcpSrc}
          // @ts-expect-error — imagesrcset/imagesizes geçerli HTML attr, React tipleri henüz eksik
          imagesrcset={lcpSrcSet}
          imagesizes="100vw"
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

  if (!isSSR() && !isPreviewBot()) return {};

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

// force-dynamic kaldırıldı — isPreviewBot() headers() çağırdığı için route zaten dynamic.
// Ürün verisi suspensedView içinde unstable_cache ile 1 saat cache'leniyor.

export default ProductPage;
