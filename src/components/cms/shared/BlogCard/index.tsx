'use client';

import Icon from '@/components/Icon';
import Link from '@/components/common/Link';
import CMSImage from '@/components/cms/shared/CMSImage';
import { Box, Chip, Stack, Typography } from '@mui/material';

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
  readTime?: number;
}

const BlogCard = ({
  slug,
  title,
  excerpt,
  coverImage,
  publishedAt,
  category,
  readTime,
}: BlogCardProps) => {
  return (
    <Link href={`/blog/${slug}`} style={{ textDecoration: 'none' }}>
      <Stack
        direction={{ xs: 'row', md: 'column' }}
        sx={{
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#fff',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.06)',
          '&:hover': {
            transform: { xs: 'none', md: 'translateY(-4px)' },
            boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.08)', md: '0 12px 24px rgba(0,0,0,0.1)' },
            '& .blog-image': {
              transform: 'scale(1.05)',
            },
            '& .blog-title': {
              color: 'primary.main',
            },
          },
        }}
      >
        {/* Image Container */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            width: { xs: 100, md: '100%' },
            minWidth: { xs: 100, md: 'auto' },
            aspectRatio: { xs: '1/1', md: '16/9' },
          }}
        >
          {coverImage && (
            <Box
              className="blog-image"
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transition: 'transform 0.4s ease',
              }}
            >
              <CMSImage
                src={coverImage.url}
                alt={coverImage.alternativeText}
                fill
              />
            </Box>
          )}

          {/* Category Badge - Desktop only */}
          {category && (
            <Chip
              label={category}
              size="small"
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: 'primary.main',
                color: '#fff',
                fontWeight: 600,
                fontSize: 10,
                height: 22,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}
        </Box>

        {/* Content */}
        <Stack
          sx={{
            p: { xs: 1.5, md: 2 },
            gap: { xs: 0.5, md: 1 },
            flex: 1,
            justifyContent: { xs: 'center', md: 'flex-start' },
          }}
        >
          {/* Mobile: Category + Date row */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            {category && (
              <Typography
                sx={{
                  color: 'primary.main',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {category}
              </Typography>
            )}
            {publishedAt && (
              <Typography sx={{ color: 'text.secondary', fontSize: 11 }}>
                {new Date(publishedAt).toLocaleDateString('tr-TR', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
            )}
          </Stack>

          {/* Title */}
          <Typography
            className="blog-title"
            sx={{
              fontWeight: 600,
              fontSize: { xs: 14, md: 16 },
              lineHeight: 1.35,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              transition: 'color 0.2s ease',
            }}
          >
            {title}
          </Typography>

          {/* Excerpt - Desktop only */}
          {excerpt && (
            <Typography
              sx={{
                display: { xs: 'none', md: '-webkit-box' },
                color: 'text.secondary',
                fontSize: 13,
                lineHeight: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {excerpt}
            </Typography>
          )}

          {/* Footer - Desktop only */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              display: { xs: 'none', md: 'flex' },
              mt: 'auto',
              pt: 1,
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Icon name="schedule" fontSize={14} sx={{ color: 'text.secondary' }} />
              <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                {readTime || 3} dk
              </Typography>
              {publishedAt && (
                <>
                  <Typography sx={{ color: 'text.disabled', mx: 0.5 }}>•</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
                    {new Date(publishedAt).toLocaleDateString('tr-TR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                </>
              )}
            </Stack>
            <Icon name="arrow_forward" fontSize={16} sx={{ color: 'primary.main' }} />
          </Stack>

          {/* Mobile: Read time */}
          <Stack
            direction="row"
            alignItems="center"
            gap={0.5}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <Icon name="schedule" fontSize={12} sx={{ color: 'text.secondary' }} />
            <Typography sx={{ color: 'text.secondary', fontSize: 11 }}>
              {readTime || 3} dk okuma
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Link>
  );
};

export default BlogCard;
