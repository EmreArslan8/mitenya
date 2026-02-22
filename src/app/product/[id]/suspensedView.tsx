import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import ProductPageView from './view';
import { notFound } from 'next/navigation';
import JsonLdScript from '@/components/SEO/JsonLdScript';
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildProductJsonLd } from '@/lib/seo/productJsonLd';

const SuspensedView = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const data = await fetchProductDataSupabase(id);
  if (!data) {
    notFound();
  }
  const productJsonLd = buildProductJsonLd(data);
  const faqJsonLd = buildFaqJsonLd(data);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(data);

  return (
    <>
      <JsonLdScript json={productJsonLd} />
      {faqJsonLd && <JsonLdScript json={faqJsonLd} />}
      <JsonLdScript json={breadcrumbJsonLd} />
      <ProductPageView data={data} />
    </>
  );
};

export default SuspensedView;
