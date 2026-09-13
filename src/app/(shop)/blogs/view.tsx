import BlogCard from '@/components/cms/shared/BlogCard';
import { Divider } from '@/components/ui/Divider';

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
    <div className="flex flex-col gap-8 md:gap-12">
      {/* Page Header */}
      <header className="flex flex-col gap-3 pt-2 md:pt-4">
        <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-gray-800 md:text-4xl">
          Blog
        </h1>
        <p className="max-w-[520px] text-sm leading-normal text-[#6E6E73] md:text-base">
          Cilt bakımı, kozmetik trendleri ve güzellik ipuçları hakkında en güncel yazılar.
        </p>
        <span className="mt-1 h-[3px] w-10 rounded-sm bg-accentRed" />
      </header>
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
            <Divider className="border-gray-100" />
          )}
        </>
      )}

      {rest.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-800 md:text-[22px]">
            Tüm Yazılar
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {rest.map((blog) => (
              <div key={blog.id}>
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
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {blogs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <h2 className="text-lg font-semibold text-gray-800">
            Henüz yazı yok
          </h2>
          <p className="text-center text-sm text-gray-500">
            Blog yazıları yakında burada olacak.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogPageView;
