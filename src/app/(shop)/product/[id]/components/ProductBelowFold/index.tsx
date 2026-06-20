'use client';

import dynamic from 'next/dynamic';
import { ShopProductData } from '@/lib/api/types';
import DeferUntilVisible from '../DeferUntilVisible';

// Client wrapper: below-fold bloklar. dynamic({ssr:false}) Server Component'te
// kullanılamadığı için bu wrapper client'tır; ama içerikler zaten DeferUntilVisible
// (IntersectionObserver) arkasında ertelenir, yani görünene kadar yüklenmez/hydrate olmaz.

const ProductFaq = dynamic(() => import('../ProductFaq'), {
  loading: () => null,
});
const ProductRecommendations = dynamic(() => import('../ProductRecommendations'), {
  ssr: false,
  loading: () => null,
});
const ProductReviews = dynamic(() => import('../ProductReviews'), {
  ssr: false,
  loading: () => null,
});
const ProductShopAssistant = dynamic(() => import('../ProductShopAssistant'), {
  ssr: false,
  loading: () => null,
});

const ProductBelowFold = ({
  data,
  fullName,
}: {
  data: ShopProductData;
  fullName: string;
}) => {
  return (
    <>
      <ProductFaq faqs={data.faqs} productName={fullName} />
      <div id="product-reviews">
        <DeferUntilVisible minHeight={240}>
          <ProductReviews
            productId={data.id}
            initialReviews={data.reviews ?? []}
            initialRating={data.rating}
          />
        </DeferUntilVisible>
      </div>
      {data.brandId && (
        <DeferUntilVisible minHeight={320}>
          <ProductRecommendations brandId={data.brandId} productId={data.id} />
        </DeferUntilVisible>
      )}
      <DeferUntilVisible>
        <ProductShopAssistant data={data} />
      </DeferUntilVisible>
    </>
  );
};

export default ProductBelowFold;
