import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DayCareView from './view';
import { fetchProductsSupabase, fetchCollectionBySlug } from '@/lib/api/supabaseShop';
import { ShopSearchSort } from '@/lib/api/types';

const host = (process.env.NEXT_PUBLIC_HOST_URL ?? 'https://mitenya.com').replace(/\/$/, '');
const COLLECTION_SLUG = 'day-care';

export default async function DayCarePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? 1);
  const sort = (resolvedSearchParams.sort as ShopSearchSort) || undefined;

  // Fetch collection info and products
  const [collection, data] = await Promise.all([
    fetchCollectionBySlug(COLLECTION_SLUG),
    fetchProductsSupabase({
      collection: COLLECTION_SLUG,
      page,
      sort
    })
  ]);

  // Collection yoksa veya ürün yoksa 404
  if (!collection || !data?.products?.length) {
    notFound();
  }

  return <DayCareView initialData={data} collection={collection} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const collection = await fetchCollectionBySlug(COLLECTION_SLUG);
  const url = `${host}/collection/${COLLECTION_SLUG}`;
  const title = collection?.name ?? 'Gündüz Bakımı Koleksiyonu';
  const description = collection?.description ?? 'Güne ışıldayarak başlayın. SPF korumalı nemlendiriciler ve aydınlatıcı serumlarla cildinizi gün boyu koruyun.';

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Mitenya`,
      description,
      url,
      images: [
        {
          url: collection?.banner_image ?? '/static/images/collections/day-care-og.webp',
          width: 1200,
          height: 630,
          alt: `${title} - Kore Kozmetik | Mitenya`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Mitenya`,
      description,
      images: [collection?.banner_image ?? '/static/images/collections/day-care-og.webp'],
    },
  };
}

export const dynamic = 'force-dynamic';
