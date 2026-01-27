import { Stack, Typography } from '@mui/material';
import CMSImage from '@/components/cms/shared/CMSImage';
import DOMPurify from 'isomorphic-dompurify';

interface BlogEntity {
  id: number;
  attributes: {
    title: string;
    content: string;
    publishDate?: string;
    publishedAt?: string;
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
    'div', 'span'
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
};

function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, sanitizeConfig);
}

async function getBlog(slug: string): Promise<BlogEntity | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/blogs?filters[slug][$eq]=${slug}&populate=*`,
    { cache: 'no-store' }
  );

  const json = await res.json();
  return json.data?.[0] ?? null;
}

const BlogDetailPageView = async ({ slug }: { slug: string }) => {
  const blog = await getBlog(slug);

  if (!blog) return <Typography>Blog bulunamadı</Typography>;

  const { title, content, publishDate, publishedAt, cover } =
    blog.attributes;

  return (
    <Stack gap={4}>
      <Typography variant="h3" fontWeight={700}>
        {title}
      </Typography>

      {(publishDate || publishedAt) && (
        <Typography variant="caption" color="text.secondary">
          {new Date(
            publishDate ?? publishedAt!
          ).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Typography>
      )}

      {cover?.data && (
        <CMSImage
          src={cover.data.attributes.url}
          alt={cover.data.attributes.alternativeText}
          width={1200}
          height={600}
          style={{ borderRadius: 12 }}
        />
      )}

      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
    </Stack>
  );
};

export default BlogDetailPageView;
