'use client';

import { Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { BlockComponentBaseProps } from '..';
import BlogCard from '../../shared/BlogCard';

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
    fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/blogs?sort=publishedAt:desc&pagination[limit]=${limit}&populate[cover]=*`
    )
      .then((res) => res.json())
      .then((data) => setBlogs(data?.data ?? []));
  }, [limit]);

  if (!blogs.length) return null;

  return (

      <Stack gap={4}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h1" fontWeight={700}>
            {title}
          </Typography>

          <Typography
            component="a"
            href={viewAllUrl}
            sx={{
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            {viewAllLabel}
          </Typography>
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
