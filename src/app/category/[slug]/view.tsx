/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Grid, Stack, Typography, Select, MenuItem } from '@mui/material';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import { UI_SORT_OPTIONS } from '@/lib/constants/shop';
import styles from './styles';

type CategoryViewProps = {
  category: string;
  initialData: ShopSearchResponse;
};

const SORT_LABELS: Record<ShopSearchSort, string> = {
  rct: 'Önerilen',
  disc: 'İndirimli',
  pasc: 'Fiyat (Artan)',
  pdsc: 'Fiyat (Azalan)',
  rcc: 'En Çok Değerlendirilen',
  bst: 'En çok satan',
  fav: 'En favori',
  asc: 'Fiyat (Artan)',
  dsc: 'Fiyat (Azalan)',
};

const CategoryView = ({ category, initialData }: CategoryViewProps) => {
  const allowedUiSorts = UI_SORT_OPTIONS as readonly ShopSearchSort[];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<ShopSearchSort>(
    (searchParams?.get('sort') as ShopSearchSort) ?? 'rct'
  );
  const [isNavigating, setIsNavigating] = useState(false);

  const products = initialData.products ?? [];
  const visibleSortOptions = (initialData.sortOptions ?? ['rct', 'pdsc', 'pasc']).filter(
    (opt) => allowedUiSorts.includes(opt)
  );
  const selectedSort = visibleSortOptions.includes(sort) ? sort : (visibleSortOptions[0] ?? 'rct');

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
          value={selectedSort}
          onChange={(e) => handleSortChange(e.target.value as ShopSearchSort)}
          sx={styles.sort}
        >
          {visibleSortOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {SORT_LABELS[opt] ?? opt}
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
