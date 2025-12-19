import { Grid, Stack, Typography } from '@mui/material';
import BlogCard from '@/components/cms/shared/BlogCard';

interface BlogEntity {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt?: string;
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

async function getBlogs(): Promise<BlogEntity[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/blogs?sort=publishDate:desc&populate[cover]=*`,
    { cache: 'no-store' } // istersen ISR yaparız
  );

  const json = await res.json();
  return json.data ?? [];
}

const BlogPageView = async () => {
  const blogs = await getBlogs();

  return (
    <Stack gap={6}>
      <Typography variant="h3" fontWeight={700}>
        Blog
      </Typography>

      <Grid container spacing={4}>
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

export default BlogPageView;
