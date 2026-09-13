'use client';

import { Button } from '@/components/ui/Button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { fetchProductsByIds } from '@/lib/api/shop';
import { ShopProductData } from '@/lib/api/types';
import formatPrice from '@/lib/utils/formatPrice';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';

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
        const result = await fetchProductsByIds(favoriteIdList);
        if (cancelled) return;
        setFavoriteProducts(
          result.filter((item: ShopProductData) => Boolean(item?.id && item?.url))
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
    <div className="flex w-full flex-col gap-3">
      <header className="flex items-center justify-between rounded-[14px] border border-gray-200 bg-white px-4 py-3.5 sm:px-5">
        <h2 className="text-lg font-semibold text-text">Favorilerim</h2>
        <span className="text-[13px] font-semibold text-text-medium">{favoriteIdList.length} ürün</span>
      </header>

      {(isFavoritesLoading || !isFavoritesReady || favoritesDataLoading) && (
        <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white">
          <Spinner size={22} className="text-primary" />
          <p className="text-sm font-semibold text-text-medium">Favoriler yükleniyor...</p>
        </div>
      )}

      {!isFavoritesLoading &&
        isFavoritesReady &&
        !favoritesDataLoading &&
        (!favoriteIdList.length || !favoriteProducts.length) && (
          <div className="flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-5 sm:px-5 sm:py-6">
            <h3 className="text-base font-bold text-text">Henüz favori ürünün yok</h3>
            <p className="text-sm leading-normal text-text-medium">
              Ürün kartlarındaki kalp ikonuna basarak favori listeni oluşturabilirsin.
            </p>
          </div>
        )}

      {!isFavoritesLoading && isFavoritesReady && !favoritesDataLoading && favoriteProducts.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="flex flex-col items-stretch justify-between gap-2.5 rounded-xl border border-gray-200 bg-bg-light p-2.5 sm:flex-row sm:items-center sm:p-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="size-14 shrink-0 overflow-hidden rounded-[10px] border border-gray-200 bg-white">
                  {product.imgSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imgSrc}
                      alt={product.name ?? 'Ürün'}
                      className="size-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-[1.3] text-text">{product.name ?? 'Ürün'}</p>
                  <p className="mt-1 text-sm font-bold text-text">
                    {formatPrice(product.price.currentPrice, product.price.currency)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="small" variant="outlined" color="neutral" href={product.url} className="rounded-lg font-bold normal-case">
                  Ürüne git
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="neutral"
                  onClick={() => void toggleFavorite(product.id)}
                  disabled={isFavoriteLoading(product.id)}
                  className="rounded-lg font-bold normal-case text-error"
                >
                  {isFavoriteLoading(product.id) ? 'Kaldırılıyor...' : 'Kaldır'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesCard;
