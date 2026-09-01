'use client';

import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import BlogCard from '../../shared/BlogCard';
import SectionBase from '../../shared/SectionBase';

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
    // Baslik ve "tumunu gor" butonu SectionBase'e devredildi: blok kendi
    // basligini basarken sayfadaki diger bolumlerden farkli olcek ve
    // hizalama kullaniyordu.
    <SectionBase
      sectionHeader={title}
      sectionLabel={viewAllUrl ? viewAllLabel || 'Tümünü Gör' : undefined}
      sectionHref={viewAllUrl}
    >
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
    </SectionBase>
  );
};

export default ShopBlogCards;
