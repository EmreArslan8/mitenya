import { sanityClient } from '@/lib/sanity.client';
import { productBySlugQuery, allProductSlugsQuery } from '@/lib/sanity.queries';
import { urlFor } from '@/lib/sanity.image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Loading from './loading';
import SuspensedView from './suspensedView';
import type { Metadata } from 'next';

// Dinamik segment (id aslında slug)
export const revalidate = 60;

const ProductPage = async ({ params }: { params: { id: string } }) => {
  // slug olarak kullanıyoruz
  const slug = params.id;

  const product = await sanityClient.fetch(productBySlugQuery, { slug });
  if (!product) notFound();


  return (
    <Suspense fallback={<Loading />} key={slug}>
      <SuspensedView params={{ slug }} />
    </Suspense>
  );
};

export const generateStaticParams = async () => {
  const slugs = await sanityClient.fetch<string[]>(allProductSlugsQuery);
  return slugs.map((slug) => ({ id: slug }));
};

export const generateMetadata = async ({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> => {
  const slug = params.id;
  const product = await sanityClient.fetch(productBySlugQuery, { slug });
  if (!product)
    return {
      title: 'Ürün Bulunamadı | Kozmedo',
      description: 'Bu ürün mevcut değil.',
    };

  const title = `${product.brand ? `${product.brand} ` : ''}${product.title} | Kozmedo`;
  const description = product.shortDesc ?? 'Kozmedo ürün detayları';
  const imageUrl =
    product.images?.[0]
      ? urlFor(product.images[0]).width(1200).height(630).fit('crop').url()
      : '/static/images/ogBanner.webp';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, alt: product.title, width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true },
  };
};

export default ProductPage;
