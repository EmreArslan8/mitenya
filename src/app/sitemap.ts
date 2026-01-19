import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';

const baseUrl = process.env.NEXT_PUBLIC_HOST_URL ?? 'https://mitenya.com';
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;

type BlogEntity = {
  attributes?: {
    slug?: string;
    updatedAt?: string;
    publishedAt?: string;
  };
};

const fetchBlogSlugs = async () => {
  if (!strapiUrl) return [];

  const pageSize = 100;
  let page = 1;
  let pageCount = 1;
  const entries: { slug: string; lastmod?: string }[] = [];

  while (page <= pageCount) {
    const res = await fetch(
      `${strapiUrl}/blogs?fields[0]=slug&fields[1]=updatedAt&fields[2]=publishedAt&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) break;
    const json = (await res.json()) as {
      data?: BlogEntity[];
      meta?: { pagination?: { pageCount?: number } };
    };

    const data = json.data ?? [];
    data.forEach((blog) => {
      const slug = blog.attributes?.slug;
      if (!slug) return;
      entries.push({
        slug,
        lastmod: blog.attributes?.updatedAt ?? blog.attributes?.publishedAt,
      });
    });

    pageCount = json.meta?.pagination?.pageCount ?? pageCount;
    page += 1;
  }

  return entries;
};

const fetchProductSlugs = async () => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, slug, created_at');

  if (error || !data) return [];

  return data.map((item) => ({
    slug: item.slug || item.id,
    lastmod: item.created_at ?? undefined,
  }));
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogSlugs, productSlugs] = await Promise.all([
    fetchBlogSlugs(),
    fetchProductSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
    },
  ];

  const blogRoutes = blogSlugs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.lastmod ? new Date(blog.lastmod) : new Date(),
  }));

  const productRoutes = productSlugs.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.lastmod ? new Date(product.lastmod) : new Date(),
  }));

  return [...staticRoutes, ...blogRoutes, ...productRoutes];
}
