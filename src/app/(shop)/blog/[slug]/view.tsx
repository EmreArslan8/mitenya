import { Box, Stack, Typography } from '@mui/material';
import DOMPurify from 'isomorphic-dompurify';
import BlogCard from '@/components/cms/shared/BlogCard';
import CMSImage from '@/components/cms/shared/CMSImage';
import ArticleNav from './ArticleNav';
import SidebarArticles, { type SidebarArticle } from './SidebarArticles';
import ShareBox from './ShareBox';
import { prepareArticle } from './article';
import styles from './styles';

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
      <Stack alignItems="center" justifyContent="center" sx={styles.notFound}>
        <Typography sx={styles.notFoundTitle}>Blog bulunamadı</Typography>
        <Typography sx={styles.notFoundSubtitle}>
          Aradığınız yazı mevcut değil veya kaldırılmış olabilir.
        </Typography>
      </Stack>
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
    <Stack sx={styles.page}>
      {cover?.data && (
        <Box sx={styles.cover}>
          <CMSImage
            src={cover.data.attributes.url}
            alt={cover.data.attributes.alternativeText || title}
            fill
            sizes="(max-width: 1200px) 100vw, 1160px"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
          />
        </Box>
      )}

      {/* Solda okuma sütunu · sağda arama, öne çıkanlar ve bölüm listesi */}
      <Box sx={styles.grid}>
        <Box component="article" sx={styles.contentColumn}>
          {/* Başlık ve künye */}
          <Stack sx={styles.header}>
            <Typography component="span" sx={styles.eyebrow}>
              Cilt bakım rehberi
            </Typography>

            <Typography component="h1" sx={styles.title}>
              {title}
            </Typography>

            <Stack sx={styles.byline}>
              <Box aria-hidden sx={styles.bylineAvatar}>
                {authorName.charAt(0).toLocaleUpperCase('tr-TR')}
              </Box>
              <Typography component="span" sx={styles.bylineName}>
                {authorName}
              </Typography>
              {publishedLabel && (
                <>
                  <Box sx={styles.metaDot} />
                  <Typography component="time" dateTime={publishedIso} sx={styles.metaText}>
                    {publishedLabel}
                  </Typography>
                </>
              )}
              <Box sx={styles.metaDot} />
              <Typography component="span" sx={styles.metaText}>
                {readingMinutes} dk okuma
              </Typography>
              {updatedLabel && (
                <>
                  <Box sx={styles.metaDot} />
                  <Typography component="span" sx={styles.metaText}>
                    Güncellendi: {updatedLabel}
                  </Typography>
                </>
              )}
            </Stack>

            {excerpt && <Typography sx={styles.excerpt}>{excerpt}</Typography>}
          </Stack>

          {toc.length > 1 && (
            <Box component="details" sx={styles.mobileToc}>
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
            </Box>
          )}

          <Box dangerouslySetInnerHTML={{ __html: html }} sx={styles.article} />

          <Stack direction="row" sx={styles.authorCard}>
            <Box aria-hidden sx={styles.authorMark}>M</Box>
            <Stack sx={styles.authorBody}>
              <Typography sx={styles.authorLabel}>Yazıyı hazırlayan</Typography>
              <Typography sx={styles.authorTitle}>{author || 'Mitenya Editör'}</Typography>
              <Typography sx={styles.authorText}>
                Mitenya cilt bakım içerikleri, ürün formülasyonları ve kullanım rutinleri üzerine
                hazırlanır. İçerikler bilgilendirme amaçlıdır; tıbbi tavsiye yerine geçmez.
              </Typography>
            </Stack>
          </Stack>

          <Box sx={styles.footerShare}>
            <Typography component="span" sx={styles.shareLabel}>Bu yazıyı paylaş</Typography>
            <ShareBox title={title} />
          </Box>
        </Box>

        <Box component="aside" sx={styles.railRight}>
          <SidebarArticles items={sidebarItems} />
          <ArticleNav items={toc} />
        </Box>
      </Box>

      {relatedBlogs.length > 0 && (
        <Stack component="section" sx={styles.related}>
          <Typography component="h2" sx={styles.relatedTitle}>
            İlgili Yazılar
          </Typography>
          <Box sx={styles.relatedGrid}>
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
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

export default BlogDetailPageView;
