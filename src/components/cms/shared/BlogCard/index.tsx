'use client';

import Link from '@/components/common/Link';
import CMSImage from '@/components/cms/shared/CMSImage';
import { Box, Stack, Typography } from '@mui/material';
import { ArrowRight, Calendar } from 'lucide-react';
import styles from './styles';

export interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: {
    url: string;
    alternativeText?: string;
  };
  publishedAt?: string;
  category?: string;
  featured?: boolean;
}

const BlogCard = ({
  slug,
  title,
  excerpt,
  coverImage,
  publishedAt,
  category,
  featured = false,
}: BlogCardProps) => {
  const imageSizes = featured
    ? '(max-width: 900px) 100vw, 55vw'
    : '(max-width: 900px) 110px, 33vw';
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;

  return (
    <Link
      href={`/blog/${slug}`}
      aria-label={`${title} yazısını oku`}
      style={{ display: 'block', height: '100%', textDecoration: 'none' }}
    >
      <Stack
        direction={featured ? { xs: 'column', md: 'row' } : { xs: 'row', md: 'column' }}
        sx={styles.card(featured)}
      >
        {/* Image */}
        <Box sx={styles.imageWrapper(featured)}>
          {coverImage ? (
            <Box
              className="blog-image"
              sx={styles.image}
            >
              <CMSImage
                src={coverImage.url}
                alt={coverImage.alternativeText || title}
                fill
                sizes={imageSizes}
                style={{ objectFit: 'cover' }}
              />
            </Box>
          ) : (
            <Box sx={styles.imageFallback}>
              <Typography sx={styles.imageFallbackText}>M</Typography>
            </Box>
          )}

          {/* Category badge */}
          {category && (
            <Box sx={styles.categoryBadge}>
              {category}
            </Box>
          )}
        </Box>

        {/* Content */}
        <Stack sx={styles.content(featured)}>
          {/* Date */}
          {formattedDate && (
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Calendar size={13} color="#8E8E93" />
              <Typography sx={styles.dateText(featured)}>
                {formattedDate}
              </Typography>
            </Stack>
          )}
          <Typography sx={styles.title(featured)}>{title}</Typography>
          {excerpt && (
            <Typography sx={styles.excerpt(featured)}>
              {excerpt}
            </Typography>
          )}
          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={styles.readMore(featured)}
          >
            <Typography sx={styles.readMoreText}>
              Devamını Oku
            </Typography>
            <Box
              className="blog-arrow"
              component="span"
              sx={styles.readMoreArrow}
            >
              <ArrowRight size={16} />
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Link>
  );
};

export default BlogCard;
