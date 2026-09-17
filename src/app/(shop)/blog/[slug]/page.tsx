import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stripBrandSuffix } from './metadata';
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

/**
 * Yazı gerçekten yok mu, yoksa geçici bir hata mı — ayırmak şart.
 * İkisini de `null` saymak, Strapi bir an cevap vermediğinde yayındaki bir
 * yazıya 404 bastırır ve Google'ın onu dizinden düşürmesine yol açar.
 */
type BlogResult =
  | { status: 'found'; blog: BlogEntity }
  | { status: 'missing' }
  | { status: 'error' };

const fetchBlog = async (slug: string): Promise<BlogResult> => {
  try {
    const res = await fetch(`${host}/api/blogs/${slug}`, { next: { revalidate: 3600 } });
    if (res.status === 404) return { status: 'missing' };
    if (!res.ok) return { status: 'error' };
    const json = await res.json();
    return json ? { status: 'found', blog: json } : { status: 'missing' };
  } catch {
    return { status: 'error' };
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchBlog(slug);

  // Olmayan yazı: arama motoruna dizine alınacak bir şey yok.
  if (result.status === 'missing') {
    return { title: 'Sayfa bulunamadı', robots: { index: false, follow: false } };
  }

  const blog = result.status === 'found' ? result.blog : null;
  const seo = blog?.attributes?.seo;

  // Geçici hata: sayfa render edilir (istemci yeniden dener) ama eksik içerik
  // dizine girmesin.
  const transient = result.status === 'error';

  const title = stripBrandSuffix(seo?.metaTitle ?? blog?.attributes?.title ?? slug);
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
    ...(transient && { robots: { index: false, follow: false } }),
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
  const result = await fetchBlog(slug);

  // Gerçek 404: Next 404 durum kodu döndürsün. Aksi halde uydurulan her slug
  // 200 + "index, follow" ile yanıtlanıyor ve sonsuz sayıda yumuşak-404 sayfası
  // taranabilir hale geliyordu.
  if (result.status === 'missing') notFound();

  const structuredData =
    result.status === 'found' ? result.blog?.attributes?.seo?.structuredData : undefined;

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
