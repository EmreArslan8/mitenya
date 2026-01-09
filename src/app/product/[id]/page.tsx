import { ShopProductData } from '@/lib/api/types';
import isPreviewBot from '@/lib/utils/isPreviewBot';
import isSSR from '@/lib/utils/isSSR';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from './loading';
import SuspensedView from './suspensedView';
import { fetchProductData } from '@/lib/api/shop';

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

  const data = await fetchProductData(id);

  return {
    title: { absolute: `${data?.brand ?? ''} ${data?.name ?? ''} | Mitenya` },
    openGraph: {
      title: `${data?.brand ?? ''} ${data?.name ?? ''} | Mitenya`,
      images: [
        {
          url: data?.imgSrc ?? '/static/images/ogBanner.webp',
          alt: data?.name,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export const dynamic = 'force-dynamic';

export default ProductPage;
