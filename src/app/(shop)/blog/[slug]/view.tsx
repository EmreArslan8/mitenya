import { Box, Stack, Typography } from '@mui/material';
import CMSImage from '@/components/cms/shared/CMSImage';
import DOMPurify from 'isomorphic-dompurify';
import { ChevronRight } from 'lucide-react';

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

const BlogDetailPageView = async ({ slug }: { slug: string }) => {
  const blog = await getBlog(slug);

  if (!blog) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 12, gap: 1.5 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#1C1C1E' }}>
          Blog bulunamadı
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#8E8E93' }}>
          Aradığınız yazı mevcut değil veya kaldırılmış olabilir.
        </Typography>
      </Stack>
    );
  }

  const { title, content, publishDate, publishedAt, cover } = blog.attributes;

  const formattedDate = (publishDate || publishedAt)
    ? new Date(publishDate ?? publishedAt!).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <Stack
      sx={{
        maxWidth: 780,
        mx: 'auto',
        width: '100%',
        gap: { xs: 3, md: 5 },
        pb: { xs: 6, md: 10 },
      }}
    >
      {/* Breadcrumb */}
      <Stack
        direction="row"
        alignItems="center"
        gap={0.5}
        sx={{ pt: { xs: 1, md: 2 } }}
      >
        <Typography
          component="a"
          href="/"
          sx={{
            fontSize: 13,
            color: '#8E8E93',
            textDecoration: 'none',
            '&:hover': { color: '#3A3A3C' },
          }}
        >
          Ana Sayfa
        </Typography>
        <ChevronRight size={14} color="#AEAEB2" />
        <Typography
          component="a"
          href="/blogs"
          sx={{
            fontSize: 13,
            color: '#8E8E93',
            textDecoration: 'none',
            '&:hover': { color: '#3A3A3C' },
          }}
        >
          Blog
        </Typography>
        <ChevronRight size={14} color="#AEAEB2" />
        <Typography
          sx={{
            fontSize: 13,
            color: '#3A3A3C',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 200,
          }}
        >
          {title}
        </Typography>
      </Stack>

      {/* Article Header */}
      <Stack gap={2}>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 26, md: 36 },
            fontWeight: 800,
            color: '#1C1C1E',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>

        {formattedDate && (
          <Typography
            sx={{
              fontSize: { xs: 13, md: 14 },
              color: '#8E8E93',
              fontWeight: 500,
            }}
          >
            {formattedDate}
          </Typography>
        )}
      </Stack>

      {/* Cover Image */}
      {cover?.data && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#F5F5F7',
          }}
        >
          <CMSImage
            src={cover.data.attributes.url}
            alt={cover.data.attributes.alternativeText}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </Box>
      )}

      {/* Article Content */}
      <Box
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        sx={{
          color: '#3A3A3C',
          fontSize: { xs: 15, md: 17 },
          lineHeight: 1.8,
          letterSpacing: '0.01em',

          '& h1': {
            fontSize: { xs: 24, md: 30 },
            fontWeight: 800,
            color: '#1C1C1E',
            mt: 5,
            mb: 2,
            lineHeight: 1.25,
          },
          '& h2': {
            fontSize: { xs: 20, md: 24 },
            fontWeight: 700,
            color: '#1C1C1E',
            mt: 4,
            mb: 1.5,
            lineHeight: 1.3,
          },
          '& h3': {
            fontSize: { xs: 17, md: 20 },
            fontWeight: 700,
            color: '#1C1C1E',
            mt: 3,
            mb: 1,
            lineHeight: 1.35,
          },
          '& h4, & h5, & h6': {
            fontSize: { xs: 16, md: 18 },
            fontWeight: 600,
            color: '#1C1C1E',
            mt: 2.5,
            mb: 1,
          },
          '& p': {
            mb: 2,
            '&:last-child': { mb: 0 },
          },
          '& a': {
            color: '#1C1C1E',
            fontWeight: 600,
            textDecorationColor: '#C1121F',
            textUnderlineOffset: '3px',
            transition: 'color 0.2s ease',
            '&:hover': { color: '#C1121F' },
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            my: 3,
          },
          '& blockquote': {
            borderLeft: '3px solid #C1121F',
            pl: 3,
            ml: 0,
            my: 3,
            color: '#6E6E73',
            fontStyle: 'italic',
            fontFamily: 'var(--font-albert-sans-italic)',
            fontSize: { xs: 16, md: 18 },
          },

          '& ul, & ol': {
            pl: 3,
            mb: 2,
            '& li': {
              mb: 0.75,
            },
          },
          '& pre': {
            bgcolor: '#F5F5F7',
            borderRadius: '8px',
            p: 2.5,
            overflow: 'auto',
            my: 3,
            fontSize: 14,
          },
          '& code': {
            bgcolor: '#F5F5F7',
            px: 0.75,
            py: 0.25,
            borderRadius: '4px',
            fontSize: '0.9em',
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            my: 3,
            '& th, & td': {
              border: '1px solid #E5E5EA',
              px: 2,
              py: 1.5,
              textAlign: 'left',
              fontSize: 14,
            },
            '& th': {
              bgcolor: '#F5F5F7',
              fontWeight: 600,
              color: '#1C1C1E',
            },
          },
          '& strong, & b': {
            fontWeight: 700,
            color: '#1C1C1E',
          },
        }}
      />
    </Stack>
  );
};

export default BlogDetailPageView;
