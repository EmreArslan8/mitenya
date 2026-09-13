'use client';

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
    cover?: { data?: { attributes: { url: string; alternativeText?: string } } };
  };
}

export interface ShopBlogCardsProps extends BlockComponentBaseProps {
  title?: string;
  limit?: number;
  viewAllLabel?: string;
  viewAllUrl?: string;
}

const ShopBlogCards = ({ title, limit, viewAllLabel, viewAllUrl }: ShopBlogCardsProps) => {
  const [blogs, setBlogs] = useState<BlogEntity[]>([]);
  useEffect(() => {
    fetch(`/api/blogs?limit=${limit ?? 10}`).then((response) => response.json()).then((data) => setBlogs(data?.data ?? [])).catch((error) => console.error('Blog fetch error:', error));
  }, [limit]);
  if (!blogs.length) return null;

  return (
    <SectionBase sectionHeader={title} sectionLabel={viewAllUrl ? viewAllLabel || 'Tümünü Gör' : undefined} sectionHref={viewAllUrl}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} slug={blog.attributes.slug} title={blog.attributes.title} excerpt={blog.attributes.excerpt} publishedAt={blog.attributes.publishDate ?? blog.attributes.publishedAt} coverImage={blog.attributes.cover?.data?.attributes} />
        ))}
      </div>
    </SectionBase>
  );
};

export default ShopBlogCards;
