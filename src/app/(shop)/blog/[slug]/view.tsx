import DOMPurify from 'isomorphic-dompurify';
import BlogCard from '@/components/cms/shared/BlogCard';
import CMSImage from '@/components/cms/shared/CMSImage';
import ArticleNav from './ArticleNav';
import SidebarArticles, { type SidebarArticle } from './SidebarArticles';
import ShareBox from './ShareBox';
import { prepareArticle } from './article';

interface BlogEntity {
  id: number;
  attributes: {
    title: string;
    content: string;
    excerpt?: string;
    author?: string;
    publishDate?: string;
    publishedAt?: string;
    updatedAt?: string;
    cover?: {
      data?: {
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
  };
}

// XSS koruması için güvenli HTML sanitize ayarları
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, sanitizeConfig);
}

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

async function getBlog(slug: string): Promise<BlogEntity | null> {
  if (!strapiUrl || !cmsBearer) return null;

  const res = await fetch(
    `${strapiUrl}/blogs?filters[slug][$eq]=${slug}&populate=*&publicationState=live`,
    {
      headers: { Authorization: `Bearer ${cmsBearer}` },
      next: { revalidate: 60 },
    }
  );

  const json = await res.json();
  return json.data?.[0] ?? null;
}

interface BlogSummary {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt?: string;
    publishDate?: string;
    publishedAt?: string;
    cover?: { data?: { attributes: { url: string; alternativeText?: string } } };
  };
}

async function getOtherBlogs(slug: string): Promise<BlogSummary[]> {
  if (!strapiUrl || !cmsBearer) return [];

  const res = await fetch(
    `${strapiUrl}/blogs?sort=publishDate:desc&filters[slug][$ne]=${slug}` +
      '&pagination[limit]=9&populate[cover]=*&publicationState=live',
    {
      headers: { Authorization: `Bearer ${cmsBearer}` },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

const BlogDetailPageView = async ({ slug }: { slug: string }) => {
  const [blog, otherBlogs] = await Promise.all([getBlog(slug), getOtherBlogs(slug)]);

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <h1 className="text-lg font-semibold text-gray-800">Blog bulunamadı</h1>
        <p className="text-sm text-gray-500">
          Aradığınız yazı mevcut değil veya kaldırılmış olabilir.
        </p>
      </div>
    );
  }

  const {
    title,
    content,
    excerpt,
    author,
    publishDate,
    publishedAt,
    updatedAt,
    cover,
  } = blog.attributes;

  const { html, toc, readingMinutes } = prepareArticle(sanitizeHtml(content));

  const authorName = author || 'Mitenya Editör';
  const sidebarItems: SidebarArticle[] = otherBlogs.map((item) => ({
    slug: item.attributes.slug,
    title: item.attributes.title,
    date: formatDate(item.attributes.publishDate ?? item.attributes.publishedAt),
  }));
  const relatedBlogs = otherBlogs.slice(0, 3);

  const publishedLabel = formatDate(publishDate ?? publishedAt);
  const publishedIso = publishDate ?? publishedAt;
  const updatedLabel =
    updatedAt && publishedIso && new Date(updatedAt) > new Date(publishedIso)
      ? formatDate(updatedAt)
      : null;

  return (
    <div className="box-border flex w-full self-center flex-col gap-5 px-2 pb-12 pt-2 sm:px-4 md:gap-9 md:px-6 md:pb-20 md:pt-4">
      {cover?.data && (
        <div className="relative mx-auto aspect-video w-full max-w-[1160px] overflow-hidden bg-[#F8F6F2] sm:aspect-[16/3]">
          <CMSImage
            src={cover.data.attributes.url}
            alt={cover.data.attributes.alternativeText || title}
            fill
            sizes="(max-width: 1200px) 100vw, 1160px"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
        </div>
      )}

      {/* Solda okuma sütunu · sağda arama, öne çıkanlar ve bölüm listesi */}
      <div className="mx-auto grid w-full max-w-[1160px] grid-cols-[minmax(0,1fr)] items-start lg:grid-cols-[minmax(0,760px)_340px] lg:gap-x-[60px]">
        <article className="min-w-0">
          {/* Başlık ve künye */}
          <header className="mb-6 flex w-full flex-col gap-2.5 md:mb-8 md:gap-3">
            <span className="text-[11px] font-bold uppercase leading-tight tracking-[0.14em] text-accentRed">
              Cilt bakım rehberi
            </span>

            <h1 className="text-pretty text-[25px] font-semibold leading-[1.18] tracking-[-0.02em] text-gray-800 sm:text-[29px] md:text-[33px]">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-[12.5px] text-gray-500 md:text-[13.5px]">
              <span aria-hidden className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[#F2EFEA] text-xs font-bold text-[#8A6A55]">
                {authorName.charAt(0).toLocaleUpperCase('tr-TR')}
              </span>
              <span className="text-[13.5px] font-semibold text-[#3A3A3C]">
                {authorName}
              </span>
              {publishedLabel && (
                <>
                  <span className="size-[3px] shrink-0 rounded-full bg-[#C7C7CC]" />
                  <time dateTime={publishedIso}>
                    {publishedLabel}
                  </time>
                </>
              )}
              <span className="size-[3px] shrink-0 rounded-full bg-[#C7C7CC]" />
              <span>
                {readingMinutes} dk okuma
              </span>
              {updatedLabel && (
                <>
                  <span className="size-[3px] shrink-0 rounded-full bg-[#C7C7CC]" />
                  <span>
                    Güncellendi: {updatedLabel}
                  </span>
                </>
              )}
            </div>

            {excerpt && <p className="max-w-[760px] text-base leading-[1.65] text-[#48484A] md:text-[19px]">{excerpt}</p>}
          </header>

          {toc.length > 1 && (
            <details className="blog-mobile-toc mb-7 rounded-[10px] border border-gray-100 bg-[#FAFAFA] px-4 py-3.5 md:mb-9 md:px-5 md:py-4 lg:hidden">
              <summary>
                <span>Bu rehberde</span>
                <small>{toc.length} bölüm</small>
              </summary>
              <ol>
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <div className="blog-article" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="mt-10 flex items-start gap-4 border-t border-gray-100 pt-6 md:mt-14 md:pt-7">
            <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-gray-800 text-lg font-extrabold text-white">M</span>
            <div className="flex max-w-[580px] flex-col gap-[3px]">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.11em] text-gray-500">Yazıyı hazırlayan</span>
              <span className="text-[15px] font-bold text-gray-800">{author || 'Mitenya Editör'}</span>
              <p className="text-[13.5px] leading-relaxed text-[#6E6E73] md:text-sm">
                Mitenya cilt bakım içerikleri, ürün formülasyonları ve kullanım rutinleri üzerine
                hazırlanır. İçerikler bilgilendirme amaçlıdır; tıbbi tavsiye yerine geçmez.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 sm:pl-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">Bu yazıyı paylaş</span>
            <ShareBox title={title} />
          </div>
        </article>

        <aside className="sticky top-24 hidden max-h-[calc(100vh-128px)] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 lg:block">
          <SidebarArticles items={sidebarItems} />
          <ArticleNav items={toc} />
        </aside>
      </div>

      {relatedBlogs.length > 0 && (
        <section className="mx-auto mt-8 flex w-full max-w-[1160px] flex-col gap-5 border-t border-gray-100 pt-8 md:mt-14 md:gap-8 md:pt-12">
          <h2 className="text-center text-[22px] font-bold tracking-[-0.02em] text-gray-800 md:text-[28px]">
            İlgili Yazılar
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
            {relatedBlogs.map((item) => (
              <BlogCard
                key={item.id}
                slug={item.attributes.slug}
                title={item.attributes.title}
                excerpt={item.attributes.excerpt}
                publishedAt={item.attributes.publishDate ?? item.attributes.publishedAt}
                coverImage={item.attributes.cover?.data?.attributes}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetailPageView;
