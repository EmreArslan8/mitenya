import { Metadata } from 'next';
import BlogDetailPageView from './view';

const host = process.env.NEXT_PUBLIC_HOST_URL?.replace(/\/$/, '') ?? 'https://mitenya.com';

type BlogEntity = {
  attributes?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    cover?: { data?: { attributes?: { url?: string; alternativeText?: string } } };
  };
};

const fetchBlog = async (slug: string): Promise<BlogEntity | null> => {
  try {
    const res = await fetch(`${host}/api/blogs/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json ?? null;
  } catch {
    return null;
  }
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const blog = await fetchBlog(params.slug);
  const title = blog?.attributes?.title ?? params.slug;
  const description =
    blog?.attributes?.excerpt?.slice(0, 160) ??
    `${title} | Mitenya Blog`;
  const image =
    blog?.attributes?.cover?.data?.attributes?.url ??
    '/static/images/ogBanner.webp';
  const url = `${host}/blog/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

const BlogDetailPage = async ({
  params,
}: {
  params: { slug: string };
}) => {
  return <BlogDetailPageView slug={params.slug} />;
};

export default BlogDetailPage;
