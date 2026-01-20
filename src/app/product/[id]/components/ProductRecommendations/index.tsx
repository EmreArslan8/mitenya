import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { fetchRecommendations } from '@/lib/api/shop';
import { ShopProductListItemData } from '@/lib/api/types';
import { Grid, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

const ProductRecommendations = ({ brandId, productId }: { brandId: string; productId: string }) => {
  const [recommendations, setRecommendations] = useState<ShopProductListItemData[]>();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchRecommendations({ brandId, productId });
      setRecommendations(res ?? []);
    } catch (error) {
      setRecommendations([]);
      console.log(error);
    }
  }, [brandId, productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (recommendations?.length === 0) return <></>;

  return (
    <Stack gap={2} >
      <Typography variant="h3">Benzer Ürünler</Typography>
      <Grid container spacing={2}>
        {recommendations
          ? recommendations.map((e) => (
              <Grid item xs={6} sm={3} md={3} key={e.id}>
                <ProductCard data={e} />
              </Grid>
            ))
          : Array.from(Array(8).keys()).map((e) => (
              <Grid item xs={6} sm={4} md={2} key={e}>
                <ProductCardSkeleton />
              </Grid>
            ))}
      </Grid>
    </Stack>
  );
};

export default ProductRecommendations;
