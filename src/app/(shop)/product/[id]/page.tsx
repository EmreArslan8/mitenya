import { R2_IMAGE_PROFILES, r2ImageSrcSet, r2ImageUrl } from '@/lib/utils/r2';
import isPreviewBot from '@/lib/utils/isPreviewBot';
import isSSR from '@/lib/utils/isSSR';
import { Metadata } from 'next';
import { preload } from 'react-dom';
import { Suspense } from 'react';
import { getProductData } from './data';
import { resolveInitialGalleryIsDesktop } from './galleryViewport';
import Loading from './loading';
import SuspensedView from './suspensedView';

const preloadProductMainImage = (imagePathOrUrl: string | undefined, isDesktop: boolean) => {
  if (!imagePathOrUrl) return;

  const profile = isDesktop
    ? R2_IMAGE_PROFILES.productPdpPrimary
    : R2_IMAGE_PROFILES.productPdpMobile;

  preload(
    r2ImageUrl(imagePathOrUrl, {
      width: 960,
      quality: profile.quality,
      format: profile.format,
    }),
    {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: r2ImageSrcSet(imagePathOrUrl, profile.widths, {
        quality: profile.quality,
        format: profile.format,
      }),
      imageSizes: profile.sizes,
    }
  );
};

const ProductPage = async ({ params }: { params: { id: string } }) => {
  if (await isPreviewBot()) return <></>;

  const { id } = await params;
  const [data, isDesktop] = await Promise.all([
    getProductData(id),
    resolveInitialGalleryIsDesktop(),
  ]);
  preloadProductMainImage(data?.images?.[0] ?? data?.imgSrc, isDesktop);

  return (
    <>
      <Suspense fallback={<Loading />} key={id}> 
        <SuspensedView params={{ id }} initialData={data} />
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
  const { id } = await params; // ✔ zorunlu çözüm

  if (!isSSR() && !isPreviewBot()) return {};

  const data = await getProductData(id);

  const fullName = `${data?.brand ?? ''} ${data?.name ?? ''}`.trim();
  const defaultDescription = `${fullName} - Orijinal Kore kozmetik ürünü. En uygun fiyat ve hızlı kargo ile Mitenya'da.`;

  const title = data?.metaTitle || `${fullName} | Mitenya`;
  const description = data?.metaDescription || defaultDescription;
  const canonical = data?.url || `/product/${id}`;

  return {
    title: { absolute: title },
    description,
    keywords: data?.metaKeywords?.split(',').map((k: string) => k.trim()),
    alternates: {
      canonical,
    },
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

export const dynamic = 'force-dynamic';

export default ProductPage;
