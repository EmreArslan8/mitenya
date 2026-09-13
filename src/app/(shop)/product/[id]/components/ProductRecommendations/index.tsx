'use client';

import CustomSlider from '@/components/CustomSlider';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { fetchRecommendations } from '@/lib/api/shop';
import { ShopProductListItemData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { useCallback, useEffect, useState } from 'react';

const ProductRecommendations = ({ brandId, productId, categoryId }: { brandId: string; productId: string; categoryId?: string }) => {
  const [recommendations, setRecommendations] = useState<ShopProductListItemData[]>();
  const mdUp = useScreen('mdUp');
  const visibleRecommendations = recommendations?.slice(0, 4);
  const skeletonItems = Array.from({ length: 4 }, (_, index) => index);
  const slidesToShow = mdUp ? 4 : 2;
  const slidesToScroll = 1;

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchRecommendations({ brandId, productId, categoryId });
      setRecommendations(res ?? []);
    } catch (error) {
      setRecommendations([]);
      console.log(error);
    }
  }, [brandId, productId, categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (recommendations?.length === 0) return <></>;

  return (
    <section className="flex flex-col gap-6 px-4 sm:px-8">
      <h2 className="text-2xl leading-7 font-medium sm:text-4xl sm:leading-10">
        Benzer Ürünler
      </h2>
      <div className="relative w-full self-stretch overflow-visible pb-2 sm:pb-4">
        <CustomSlider
          slidesToShow={slidesToShow}
          slidesToScroll={slidesToScroll}
          infinite={false}
          pauseOnHover
          arrows={false}
          showControls={false}
        >
          {(visibleRecommendations ?? skeletonItems).map((item) => (
            <div
              key={typeof item === 'number' ? item : item.id}
              className="box-border h-full p-1.5 sm:p-2"
            >
              {typeof item === 'number' ? <ProductCardSkeleton /> : <ProductCard data={item} />}
            </div>
          ))}
        </CustomSlider>
      </div>
    </section>
  );
};

export default ProductRecommendations;
