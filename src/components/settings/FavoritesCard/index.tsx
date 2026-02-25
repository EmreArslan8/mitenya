'use client';

import Button from '@/components/common/Button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { fetchProductData } from '@/lib/api/shop';
import { ShopProductData } from '@/lib/api/types';
import formatPrice from '@/lib/utils/formatPrice';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import styles from './styles';

const FavoritesCard = () => {
  const { favoriteIds, isFavoritesReady, isFavoritesLoading, toggleFavorite, isFavoriteLoading } =
    useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<ShopProductData[]>([]);
  const [favoritesDataLoading, setFavoritesDataLoading] = useState(false);
  const favoriteIdList = useMemo(() => Array.from(favoriteIds), [favoriteIds]);

  useEffect(() => {
    let cancelled = false;

    const loadFavoriteProducts = async () => {
      if (!favoriteIdList.length) {
        setFavoritesDataLoading(false);
        setFavoriteProducts([]);
        return;
      }

      setFavoritesDataLoading(true);
      try {
        const result = await Promise.all(favoriteIdList.map((id) => fetchProductData(id)));
        if (cancelled) return;
        setFavoriteProducts(
          result.filter((item): item is ShopProductData => Boolean(item?.id && item?.url))
        );
      } catch (error) {
        if (!cancelled) {
          console.error('Favorites list load error:', error);
          setFavoriteProducts([]);
        }
      } finally {
        if (!cancelled) setFavoritesDataLoading(false);
      }
    };

    void loadFavoriteProducts();

    return () => {
      cancelled = true;
    };
  }, [favoriteIdList]);

  return (
    <Stack gap={1.5} width="100%">
      <Stack sx={styles.header}>
        <Typography sx={styles.headerTitle}>Favorilerim</Typography>
        <Typography sx={styles.headerCount}>{favoriteIdList.length} ürün</Typography>
      </Stack>

      {(isFavoritesLoading || !isFavoritesReady || favoritesDataLoading) && (
        <Stack sx={styles.loadingState}>
          <CircularProgress size={22} />
          <Typography sx={styles.loadingText}>Favoriler yükleniyor...</Typography>
        </Stack>
      )}

      {!isFavoritesLoading &&
        isFavoritesReady &&
        !favoritesDataLoading &&
        (!favoriteIdList.length || !favoriteProducts.length) && (
          <Stack sx={styles.emptyState}>
            <Typography sx={styles.emptyTitle}>Henüz favori ürünün yok</Typography>
            <Typography sx={styles.emptyDescription}>
              Ürün kartlarındaki kalp ikonuna basarak favori listeni oluşturabilirsin.
            </Typography>
          </Stack>
        )}

      {!isFavoritesLoading && isFavoritesReady && !favoritesDataLoading && favoriteProducts.length > 0 && (
        <Stack gap={1.25}>
          {favoriteProducts.map((product) => (
            <Stack key={product.id} sx={styles.itemCard}>
              <Stack direction="row" gap={1.2} alignItems="center" minWidth={0}>
                <Box sx={styles.imageWrap}>
                  {product.imgSrc && (
                    <img
                      src={product.imgSrc}
                      alt={product.name ?? 'Ürün'}
                      style={styles.image}
                    />
                  )}
                </Box>

                <Stack minWidth={0}>
                  <Typography sx={styles.productName}>{product.name ?? 'Ürün'}</Typography>
                  <Typography sx={styles.price}>
                    {formatPrice(product.price.currentPrice, product.price.currency)}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="row" gap={1}>
                <Button size="small" variant="outlined" color="neutral" href={product.url} sx={styles.viewButton}>
                  Ürüne git
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="neutral"
                  onClick={() => void toggleFavorite(product.id)}
                  disabled={isFavoriteLoading(product.id)}
                  sx={styles.removeButton}
                >
                  {isFavoriteLoading(product.id) ? 'Kaldırılıyor...' : 'Kaldır'}
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default FavoritesCard;
