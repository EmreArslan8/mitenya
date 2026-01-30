import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryView from './view';
import { fetchProductsSupabase } from '@/lib/api/supabaseShop';
import { ShopSearchSort } from '@/lib/api/types';
import { createClient } from '@supabase/supabase-js';

const host = (process.env.NEXT_PUBLIC_HOST_URL ?? 'https://mitenya.com').replace(/\/$/, '');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const fetchCategoryBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return data;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const categoryRow = await fetchCategoryBySlug(slug);
  if (!categoryRow) notFound();

  const page = Number(resolvedSearchParams.page ?? 1);
  const sort = (resolvedSearchParams.sort as ShopSearchSort) || undefined;

  const data = await fetchProductsSupabase({ category: categoryRow.id, page, sort });
  if (!data?.products?.length) notFound();

  return <CategoryView category={categoryRow.name} initialData={data} />;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const categoryRow = await fetchCategoryBySlug(slug);
  const categoryTitle = categoryRow?.name ?? slug;
  const url = `${host}/category/${slug}`;
  const sort = (resolvedSearchParams.sort as string | undefined) ?? '';
  const description = `${categoryTitle} kategorisindeki Kore kozmetik ürünlerini keşfedin. K-beauty, cilt bakımı ve makyaj ürünlerinde en yeni fırsatlar Mitenya'da.`;

  return {
    title: categoryTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${categoryTitle} | Mitenya`,
      description,
      url: sort ? `${url}?sort=${sort}` : url,
      images: [
        {
          url: '/static/images/ogBanner.webp',
          width: 1200,
          height: 630,
          alt: `${categoryTitle} - Kore Kozmetik | Mitenya`,
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
