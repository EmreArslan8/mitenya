import { fetchShopCouponSet, fetchShopIndex } from '@/lib/api/cms';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HomePageView from './view';
import isPreviewBot from '@/lib/utils/isPreviewBot';

/** 151 karakter — Google'in ~155-160 kesme sinirinin altinda. */
const HOME_DESCRIPTION =
  "Orijinal Kore kozmetik ve cilt bakım ürünleri Mitenya'da. Retinol serum, güneş kremi ve göz bakımında Beauty of Joseon, Numbuzin, Celimax. Hızlı kargo.";

const HomePage = async ({ params }: { params: { slug?: string } }) => {
  const bot = await isPreviewBot();

  if (bot) {
    return null;
  }
  const slug = params?.slug;
  const [data, couponSet] = await Promise.all([
    fetchShopIndex(slug),
    fetchShopCouponSet(),
  ]);

  if (!data) {
    console.error('❌ No data found, calling notFound()');
    notFound();
  }

  return (
    <main>
      <HomePageView data={data} coupons={couponSet?.coupons ?? []} />
    </main>
  );
};

export const generateMetadata = async ({
  params: { slug },
}: {
  params: { slug?: string };
}): Promise<Metadata> => {
  const data = await fetchShopIndex(slug);
  if (!data) notFound();

  return {
    title: data.title,
    // Ana sayfa aciklamasi simdilik kodda: CMS'ten gelen veri yalnizca
    // { title, blocks, gap } iceriyor (bkz. api/cms/shop-index/route.ts).
    description: HOME_DESCRIPTION,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: `${data.title} | Mitenya`,
      description: HOME_DESCRIPTION,
      url: '/',
      images: [{ url: '/static/images/ogBanner.webp', width: 1200, height: 630 }],
    },
  };
};

export default HomePage;
