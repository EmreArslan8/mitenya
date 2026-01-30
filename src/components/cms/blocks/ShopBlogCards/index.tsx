'use client';

import { Box, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import BlogCard from '../../shared/BlogCard';
import { ArrowRight } from 'lucide-react';
import styles from './styles';

interface BlogEntity {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt?: string;
    publishedAt?: string;
    publishDate?: string;
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

export interface ShopBlogCardsProps extends BlockComponentBaseProps {
  title?: string;
  limit?: number;
  viewAllLabel?: string;
  viewAllUrl?: string;
}

const ShopBlogCards = ({
  title,
  limit,
  viewAllLabel,
  viewAllUrl,
}: ShopBlogCardsProps) => {
  const [blogs, setBlogs] = useState<BlogEntity[]>([]);

  useEffect(() => {
    fetch(`/api/blogs?limit=${limit ?? 10}`)
      .then((res) => res.json())
      .then((data) => setBlogs(data?.data ?? []))
      .catch((err) => console.error('Blog fetch error:', err));
  }, [limit]);

  if (!blogs.length) return null;

  return (
    <Stack gap={4}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack gap={0.5}>
          <Typography
            sx={styles.headerTitle}
          >
            {title}
          </Typography>
          <Box sx={styles.headerAccent} />
        </Stack>

        {viewAllUrl && (
          <Typography
            component="a"
            href={viewAllUrl}
            sx={styles.viewAllLink}
          >
            {viewAllLabel || 'Tümünü Gör'}
            <ArrowRight size={16} />
          </Typography>
        )}
      </Stack>

      {/* Cards */}
      <Grid container spacing={3}>
        {blogs.map((blog) => (
          <Grid item xs={12} md={4} key={blog.id}>
            <BlogCard
              slug={blog.attributes.slug}
              title={blog.attributes.title}
              excerpt={blog.attributes.excerpt}
              publishedAt={
                blog.attributes.publishDate ??
                blog.attributes.publishedAt
              }
              coverImage={blog.attributes.cover?.data?.attributes}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default ShopBlogCards;
