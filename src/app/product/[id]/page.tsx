import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import isPreviewBot from '@/lib/utils/isPreviewBot';
import isSSR from '@/lib/utils/isSSR';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from './loading';
import SuspensedView from './suspensedView';

const ProductPage = async ({ params }: { params: { id: string } }) => {
  if (await isPreviewBot()) return <></>;

  const { id } = await params; 

  return (
    <>
      <Suspense fallback={<Loading />} key={id}> 
        <SuspensedView params={{ id }} />
      </Suspense>
    </>
  );
};

export const maxDuration = 30;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { id } = await params; // ✔ zorunlu çözüm

  if (!isSSR() && !isPreviewBot()) return {};

  const data = await fetchProductDataSupabase(id);

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
