import { Metadata } from 'next';
import BlogDetailPageView from './view';

const host = process.env.NEXT_PUBLIC_HOST_URL?.replace(/\/$/, '') ?? 'https://mitenya.com';

type BlogEntity = {
  attributes?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    cover?: { data?: { attributes?: { url?: string; alternativeText?: string } } };
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      canonicalURL?: string;
      keywords?: string;
      structuredData?: Record<string, unknown>;
      metaImage?: { data?: { attributes?: { url?: string } } };
    };
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlog(slug);
  const seo = blog?.attributes?.seo;

  const title = seo?.metaTitle ?? blog?.attributes?.title ?? slug;
  const description =
    seo?.metaDescription ??
    blog?.attributes?.excerpt?.slice(0, 160) ??
    `${title} | Mitenya Blog`;
  const canonical = seo?.canonicalURL ?? `${host}/blog/${slug}`;
  const image =
    seo?.metaImage?.data?.attributes?.url ??
    blog?.attributes?.cover?.data?.attributes?.url ??
    '/static/images/ogBanner.webp';

  return {
    title,
    description,
    ...(seo?.keywords && { keywords: seo.keywords }),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
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
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const blog = await fetchBlog(slug);
  const structuredData = blog?.attributes?.seo?.structuredData;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <BlogDetailPageView slug={slug} />
    </>
  );
};

export default BlogDetailPage;
