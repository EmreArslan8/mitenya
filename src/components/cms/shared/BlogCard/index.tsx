'use client';

import Link from '@/components/common/Link';
import CMSImage from '@/components/cms/shared/CMSImage';
import { Stack, Typography } from '@mui/material';

export interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: {
    url: string;
    alternativeText?: string;
  };
  publishedAt?: string;
}

const BlogCard = ({
  slug,
  title,
  excerpt,
  coverImage,
  publishedAt,
}: BlogCardProps) => {
  return (
    <Stack gap={1}>
      <Link href={`/blog/${slug}`}>
        <Stack
          sx={{
            position: 'relative',
            aspectRatio: '16/10',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {coverImage && (
            <CMSImage
              src={coverImage.url}
              alt={coverImage.alternativeText}
              fill
            />
          )}
        </Stack>
      </Link>

      {publishedAt && (
        <Typography variant="caption" color="text.secondary">
          {new Date(publishedAt).toLocaleDateString('tr-TR', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Typography>
      )}

      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>

      {excerpt && (
        <Typography variant="body2" color="text.secondary">
          {excerpt}
        </Typography>
      )}
    </Stack>
  );
};

export default BlogCard;
