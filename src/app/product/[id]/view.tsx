'use client';

import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { ShopCoupon, ShopProductData } from '@/lib/api/types';
import type { CMSBlock } from '@/components/cms/blocks';

const ProductReviews = dynamic(() => import('./components/ProductReviews'), { ssr: false });
const ProductRecommendations = dynamic(() => import('./components/ProductRecommendations'), { ssr: false });
const ProductFaq = dynamic(() => import('./components/ProductFaq'), { ssr: false });
const ProductShopAssistant = dynamic(() => import('./components/ProductShopAssistant'), { ssr: false });
const ProductPdpBlocks = dynamic(() => import('./components/ProductPdpBlocks'), { ssr: false });
const WelcomeCouponModal = dynamic(() => import('@/components/WelcomeCouponModal'), { ssr: false });

const ProductPageView = ({
  data,
  coupons = [],
  pdpBlocks = [],
}: {
  data: ShopProductData;
  coupons?: ShopCoupon[];
  initialGalleryIsDesktop?: boolean;
  pdpBlocks?: CMSBlock[];
}) => {
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const fullName = data.name ?? '';

  return (
    <>
      <WelcomeCouponModal coupons={coupons} placement="product" />
      {pdpBlocks.length ? <ProductPdpBlocks blocks={pdpBlocks} /> : null}
      <ProductFaq faqs={data.faqs} productName={fullName} />
      <Box ref={reviewsSectionRef} id="product-reviews">
        <ProductReviews
          productId={data.id}
          initialReviews={data.reviews ?? []}
          initialRating={data.rating}
        />
      </Box>
      {data.brandId && <ProductRecommendations brandId={data.brandId} productId={data.id} />}
      <ProductShopAssistant data={data} />
    </>
  );
};

export default ProductPageView;
