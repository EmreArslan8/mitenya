import BlogPageView from './view';

const BlogPage = async () => {
  return <BlogPageView />;
};

export const metadata = {
  title: 'Kozmetik & Cilt Bakım Blogu',
  description: 'Cilt bakım rutinleri, makyaj tüyoları ve kozmetik ürün incelemeleri. Güzellik trendleri ve uzman önerileri için Mitenya Blog\'u keşfedin.',
  alternates: {
    canonical: '/blogs',
  },
};
export default BlogPage;
