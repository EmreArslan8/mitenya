'use client';

import Banner from '@/components/common/Banner';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ShopProductData } from '@/lib/api/types';
import { trackAddToWishlist } from '@/lib/analytics/metaPixel';
import {
  trackTikTokAddToWishlist,
  trackTikTokWithUser,
} from '@/lib/analytics/tiktokPixel';
import copyTextOnClick from '@/lib/utils/copyTextOnClick';
import { Snackbar } from '@mui/material';
import { useMemo } from 'react';
import { useState } from 'react';
import ProductImageGalleryClient from '../ProductImageGallery/ProductImageGalleryClient';
import { useLiveProductData } from '../../hooks/useLiveProductData';

const ProductGalleryIsland = ({
  data,
}: {
  data: ShopProductData;
}) => {
  const { customerData, isAuthenticated, isGuest, openAuthenticator } = useAuth();
  const { isFavorite, isFavoriteLoading, toggleFavorite } = useFavorites();
  const [feedback, setFeedback] = useState<{ title: string; variant: 'success' | 'error' } | null>(null);
  const productId = String(data.id ?? '');
  const initialLiveData = useMemo(
    () => ({
      price: {
        currentPrice: data.price.currentPrice,
        originalPrice: data.price.originalPrice,
        currency: data.price.currency,
      },
      quantity: data.quantity,
      stockStatus: data.stockStatus,
    }),
    [
      data.price.currentPrice,
      data.price.originalPrice,
      data.price.currency,
      data.quantity,
      data.stockStatus,
    ]
  );
  const { price, isLive, isLoading: isLiveLoading, error: liveError } = useLiveProductData(productId, initialLiveData);
  const analyticsPrice = isLive && !isLiveLoading && !liveError ? price : undefined;
  const isFavorited = productId ? isFavorite(productId) : false;
  const favoriteLoading = productId ? isFavoriteLoading(productId) : false;

  const withAuth = (cb: () => void) => {
    if (isAuthenticated && !isGuest) {
      cb();
      return;
    }
    openAuthenticator?.({ onSuccess: cb });
  };

  const handleShareClick = async () => {
    try {
      const didCopy = await copyTextOnClick(window.location.href);
      setFeedback({
        title: didCopy ? 'Urun linki kopyalandi' : 'Urun linki kopyalanamadi',
        variant: didCopy ? 'success' : 'error',
      });
    } catch {
      setFeedback({ title: 'Urun linki kopyalanamadi', variant: 'error' });
    }
  };

  const handleFavoriteClick = async () => {
    if (!productId) return;
    if (isAuthenticated !== true || isGuest) {
      withAuth(() => void handleFavoriteClick());
      return;
    }
    const result = await toggleFavorite(productId);
    if (result.unauthorized) {
      withAuth(() => void handleFavoriteClick());
      return;
    }
    if (result.isFavorite) {
      trackAddToWishlist({ content_ids: [productId], content_name: data.name });
      trackTikTokWithUser({
        userData: {
          email: customerData?.email,
          phone: customerData?.phone,
        },
        track: () => trackTikTokAddToWishlist({
          content_ids: [productId],
          content_name: data.name,
          content_category: data.category,
              ...(analyticsPrice ? { value: analyticsPrice.currentPrice } : {}),
              currency: analyticsPrice?.currency ?? data.price.currency ?? 'TRY',
            }),
      });
    }
  };

  return (
    <>
      <ProductImageGalleryClient
        imageList={data.images?.length ? data.images : data.imgSrc ? [data.imgSrc] : []}
        mobileGallery={data.galleryImages ?? []}
        baseAlt={data.name?.trim() || 'Urun'}
        initialIsDesktop={false}
        name={data.name}
        isFavorited={isFavorited}
        favoriteLoading={favoriteLoading}
        onFavoriteClick={handleFavoriteClick}
        onShareClick={handleShareClick}
      />
      <Snackbar
        open={!!feedback}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Banner
          variant={feedback?.variant ?? 'success'}
          title={feedback?.title}
        />
      </Snackbar>
    </>
  );
};

export default ProductGalleryIsland;
