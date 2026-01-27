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
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const categorySlug = params.slug;
  const categoryRow = await fetchCategoryBySlug(categorySlug);
  if (!categoryRow) notFound();

  const page = Number(searchParams.page ?? 1);
  const sort = (searchParams.sort as ShopSearchSort) || undefined;

  const data = await fetchProductsSupabase({ category: categoryRow.id, page, sort });
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
  const description = `${categoryTitle} kategorisindeki ürünleri keşfedin. En yeni ürünler ve fırsatlar Mitenya'da.`;

  return {
    title: `${categoryTitle} | Mitenya`,
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
