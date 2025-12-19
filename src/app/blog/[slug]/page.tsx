import { Metadata } from 'next';
import BlogDetailPageView from './view';


export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return {
    title: params.slug,
  };
}

const BlogDetailPage = async ({
  params,
}: {
  params: { slug: string };
}) => {
  return <BlogDetailPageView slug={params.slug} />;
};

export default BlogDetailPage;
