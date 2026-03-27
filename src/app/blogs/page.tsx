import BlogPageView from './view';

const BlogPage = async () => {
  return <BlogPageView />;
};

export const metadata = {
  title: 'Blog',
  description: 'Kore kozmetik trendleri, K-beauty cilt bakım rutinleri ve makyaj ipuçları. Kore güzellik sırları ve ürün incelemeleri Mitenya Blog\'da.',
  alternates: {
    canonical: '/blogs',
  },
};
export default BlogPage;
