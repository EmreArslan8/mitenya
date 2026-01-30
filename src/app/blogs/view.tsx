import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import BlogCard from '@/components/cms/shared/BlogCard';
import styles from './styles';

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

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

async function getBlogs(): Promise<BlogEntity[]> {
  if (!strapiUrl || !cmsBearer) return [];

  const res = await fetch(
    `${strapiUrl}/blogs?sort=publishDate:desc&populate[cover]=*&publicationState=live`,
    {
      headers: { Authorization: `Bearer ${cmsBearer}` },
      next: { revalidate: 60 },
    }
  );

  const json = await res.json();
  return json.data ?? [];
}

const BlogPageView = async () => {
  const blogs = await getBlogs();
  const [featured, ...rest] = blogs;

  return (
    <Stack gap={{ xs: 4, md: 6 }}>
      {/* Page Header */}
      <Stack sx={styles.header}>
        <Typography sx={styles.headerTitle}>
          Blog
        </Typography>
        <Typography sx={styles.headerSubtitle}>
          Cilt bakımı, kozmetik trendleri ve güzellik ipuçları hakkında en güncel yazılar.
        </Typography>
        <Box sx={styles.headerAccent} />
      </Stack>
      {featured && (
        <>
          <BlogCard
            slug={featured.attributes.slug}
            title={featured.attributes.title}
            excerpt={featured.attributes.excerpt}
            publishedAt={
              featured.attributes.publishDate ??
              featured.attributes.publishedAt
            }
            coverImage={featured.attributes.cover?.data?.attributes}
            featured
          />
          {rest.length > 0 && (
            <Divider sx={styles.featuredDivider} />
          )}
        </>
      )}

      {rest.length > 0 && (
        <Stack gap={2}>
          <Typography sx={styles.allPostsTitle}>
            Tüm Yazılar
          </Typography>
          <Grid container spacing={3}>
            {rest.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog.id}>
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
      )}

      {/* Empty State */}
      {blogs.length === 0 && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={styles.emptyState}
        >
          <Typography sx={styles.emptyStateTitle}>
            Henüz yazı yok
          </Typography>
          <Typography sx={styles.emptyStateSubtitle}>
            Blog yazıları yakında burada olacak.
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default BlogPageView;
