/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Grid, Stack, Typography, Select, MenuItem } from '@mui/material';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import styles from './styles';

type CategoryViewProps = {
  category: string;
  initialData: ShopSearchResponse;
};

const CategoryView = ({ category, initialData }: CategoryViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<ShopSearchSort>(
    (searchParams?.get('sort') as ShopSearchSort) ?? 'rct'
  );
  const [isNavigating, setIsNavigating] = useState(false);

  const products = initialData.products ?? [];

  useEffect(() => {
    setSort((searchParams?.get('sort') as ShopSearchSort) ?? 'rct');
  }, [searchParams]);

  const handleSortChange = (value: ShopSearchSort) => {
    setSort(value);
    setIsNavigating(true);
    const params = new URLSearchParams(searchParams ?? undefined);
    value ? params.set('sort', value) : params.delete('sort');
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  };

  return (
    <Stack gap={3} sx={styles.container}>
      <Box sx={styles.hero}>
        <Stack gap={1}>
          <Typography variant="overline" sx={styles.eyebrow}>
            Seçili Koleksiyon
          </Typography>
          <Typography variant="h2" sx={styles.title}>
            {category}
          </Typography>
          <Typography sx={styles.subtitle}>
            {initialData.totalCount} ürün · En yeni eklenenler ve fırsatlar
          </Typography>
        </Stack>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="body" color="text.secondary">
          Toplam {initialData.totalCount} ürün
        </Typography>
        <Select
          size="small"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value as ShopSearchSort)}
          sx={styles.sort}
        >
          {(initialData.sortOptions ?? ['rct', 'dsc', 'asc']).map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt === 'rct'
                ? 'En yeni'
                : opt === 'dsc'
                  ? 'Fiyat (yüksek → düşük)'
                  : opt === 'asc'
                    ? 'Fiyat (düşük → yüksek)'
                    : opt}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Grid container columnSpacing={2.5} rowSpacing={3}>
        {products.map((p) => (
          <Grid item xs={6} sm={4} md={3} key={p.url}>
            <ProductCard data={p} />
          </Grid>
        ))}
        {isNavigating &&
          Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={`skeleton-${i}`}>
              <ProductCardSkeleton />
            </Grid>
          ))}
      </Grid>
    </Stack>
  );
};

export default CategoryView;
