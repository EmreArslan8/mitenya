'use client';

import CustomSlider from '@/components/CustomSlider';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { fetchRecommendations } from '@/lib/api/shop';
import { ShopProductListItemData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

const ProductRecommendations = ({ brandId, productId, categoryId }: { brandId: string; productId: string; categoryId?: string }) => {
  const [recommendations, setRecommendations] = useState<ShopProductListItemData[]>();
  const { mdUp } = useScreen();
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
    <Stack
      gap={3}
      sx={{
        px: { xs: '16px', sm: '32px' },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontSize: { xs: 24, sm: 36 },
          lineHeight: { xs: '28px', sm: '40px' },
          fontWeight: 500,
        }}
      >
        Benzer Ürünler
      </Typography>
      <Stack
        sx={{
          width: '100%',
          alignSelf: 'stretch',
          position: 'relative',
          overflow: 'visible',
          pb: { xs: 1, sm: 2 },
        }}
      >
        <CustomSlider
          slidesToShow={slidesToShow}
          slidesToScroll={slidesToScroll}
          infinite={false}
          pauseOnHover
          arrows={false}
          showControls={false}
        >
          {(visibleRecommendations ?? skeletonItems).map((item) => (
            <Stack
              key={typeof item === 'number' ? item : item.id}
              p={{ xs: 0.75, sm: 1 }}
              sx={{ boxSizing: 'border-box', height: '100%' }}
            >
              {typeof item === 'number' ? <ProductCardSkeleton /> : <ProductCard data={item} />}
            </Stack>
          ))}
        </CustomSlider>
      </Stack>
    </Stack>
  );
};

export default ProductRecommendations;
