import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryView from './view';
import { ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import { fetchCategoryBySlug } from '@/lib/api/categories';

const host = (process.env.NEXT_PUBLIC_HOST_URL ?? 'https://mitenya.com').replace(/\/$/, '');

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const categorySlug = params.slug;
  const categoryRow = await fetchCategoryBySlug(categorySlug);
  if (!categoryRow) notFound();

  const page = Number(searchParams.page ?? 1);
  const sort = (searchParams.sort as ShopSearchSort) || undefined;

  const qs = new URLSearchParams();
  qs.set('category', categoryRow.id);
  qs.set('page', String(page));
  if (sort) qs.set('sort', sort);

  const res = await fetch(`${host}/api/products?${qs.toString()}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) notFound();
  const data = (await res.json()) as ShopSearchResponse;
  if (!data?.products?.length) notFound();

  return <CategoryView category={categoryRow.name} initialData={data} />;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const categoryRow = await fetchCategoryBySlug(params.slug);
  const categoryTitle = categoryRow?.name ?? params.slug;
  const url = `${host}/category/${params.slug}`;
  const sort = (searchParams.sort as string | undefined) ?? '';
  const description = `${categoryTitle} ürünleri: yeni eklenenler, kampanyalar ve fırsatlar Mitenya'da.`;

  return {
    title: `${categoryTitle} • Mitenya`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${categoryTitle} • Mitenya`,
      description,
      url: sort ? `${url}?sort=${sort}` : url,
      images: [
        {
          url: '/static/images/ogBanner.webp',
          width: 1200,
          height: 630,
          alt: `${categoryTitle} | Mitenya`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryTitle} | Mitenya`,
      description,
      images: ['/static/images/ogBanner.webp'],
    },
  };
}

export const dynamic = 'force-dynamic';
