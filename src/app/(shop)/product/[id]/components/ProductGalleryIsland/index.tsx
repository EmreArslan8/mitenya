'use client';

import { useState } from 'react';

import Banner from '@/components/common/Banner';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ShopProductData } from '@/lib/api/types';
import copyTextOnClick from '@/lib/utils/copyTextOnClick';
import { trackAddToWishlist } from '@/lib/analytics/metaPixel';
import { trackTikTokWithUser, trackTikTokAddToWishlist } from '@/lib/analytics/tiktokPixel';
import ProductImageGalleryClient from '../ProductImageGallery/ProductImageGalleryClient';
import { Toast } from '@/components/ui/Toast';

// Client island: galeri + favori/paylaş etkileşimi. Favori/paylaş mantığı (eskiden
// view.tsx'teydi) buraya taşındı ki view.tsx server kalabilsin. Kendi paylaş
// geri-bildirim Snackbar'ını taşır (stok-bildirim Snackbar'ından bağımsız).

type FeedbackState = { title: string; variant: 'success' | 'error' } | null;

const ProductGalleryIsland = ({ data }: { data: ShopProductData }) => {
  const { customerData, isAuthenticated, openAuthenticator } = useAuth();
  const { isFavorite, isFavoriteLoading, toggleFavorite } = useFavorites();
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const productId = String(data.id ?? '');
  const isFavorited = productId ? isFavorite(productId) : false;
  const favoriteLoading = productId ? isFavoriteLoading(productId) : false;

  const withAuth = (cb: () => void) => {
    if (isAuthenticated) {
      cb();
      return;
    }
    openAuthenticator?.();
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
    if (isAuthenticated !== true) {
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
          value: data.price.currentPrice,
          currency: data.price.currency ?? 'TRY',
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
        name={data.name}
        isFavorited={isFavorited}
        favoriteLoading={favoriteLoading}
        onFavoriteClick={handleFavoriteClick}
        onShareClick={handleShareClick}
      />
      <Toast
        open={!!feedback}
        duration={3000}
        onClose={() => setFeedback(null)}
        position="top-center"
      >
        <Banner
          variant={feedback?.variant ?? 'success'}
          title={feedback?.title}
        />
      </Toast>
    </>
  );
};

export default ProductGalleryIsland;
