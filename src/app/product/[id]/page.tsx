
import { fetchProductData } from '@/lib/api/shop';
import { ShopProductData } from '@/lib/api/types';
import isPreviewBot from '@/lib/utils/isPreviewBot';
import isSSR from '@/lib/utils/isSSR';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from './loading';
import SuspensedView from './suspensedView';

const ProductPage = async ({
  params,
}: {
  params: { id: string;  };
}) => {
  // #SHUTDOWN

  
  if (await isPreviewBot()) return <></>;
  return (
    <>
      <Suspense fallback={<Loading />} key={params.id}>
        <SuspensedView params={params} />
      </Suspense>
    </>
  );
};

export const maxDuration = 30;

export const generateMetadata = async ({
  params: { id },
}: {
  params: { id: string; };
}): Promise<Metadata> => {
  if (!isSSR() && !isPreviewBot()) return {};
  const data = await fetchProductData(id);
  return {
    title: { absolute: `${data?.brand ?? ''} ${data?.name ?? ''} | Kozmedo` },
    openGraph: {
      title: `${data?.brand ?? ''} ${data?.name ?? ''} | Kozmedo`,
      images: [
        {
          url: data?.imgSrc ?? '/static/images/ogBanner.webp',
          alt: data?.name,
          width: 1200,
          height: 630,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};

export const dynamic = 'force-dynamic';

export default ProductPage;
