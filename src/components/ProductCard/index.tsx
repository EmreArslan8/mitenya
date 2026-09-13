'use client';

import { Rating } from '@/components/ui/Rating';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { Skeleton as UiSkeleton } from '@/components/ui/Skeleton';
import { Stack as UiStack } from '@/components/ui/Stack';
import Card from '@/components/common/Card';
import Banner from '@/components/common/Banner';
import { CrossFade } from '@/components/common/CrossFade';
import Link from '@/components/common/Link';
import QuickAddModal from '@/components/QuickAddModal';
import { ShopProductData, ShopProductListItemData } from '@/lib/api/types';
import { fetchProductData } from '@/lib/api/shop';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import useScreen from '@/lib/hooks/useScreen';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import formatPrice from '@/lib/utils/formatPrice';
import NextImage from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ShopContext } from '@/contexts/ShopContext';
import { Check, Heart } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useContext } from 'react';
import Button from '../ui/Button';
import { cn } from '@/lib/utils/cn';
import type { BannerVariant } from '../common/Banner';

interface ShopProductCardProps {
  data: ShopProductListItemData;
  /**
   * Kartin gercek slot genisligi. Kart her sayfada ayni genislikte DEGIL
   * (ornegin /search'te filtre sidebar'i kabi daraltiyor), bu yuzden dogru
   * deger cagiran tarafindan gelmeli. Yanlis `sizes` tarayiciya yanlis srcset
   * adayini sectirir; aday listesini budamaktan cok daha onemlidir.
   */
  sizes?: string;
}

/** Sidebar'siz, tam genislikli izgaralar icin makul varsayilan. */
const DEFAULT_CARD_SIZES = '(max-width: 599px) 50vw, (max-width: 900px) 33vw, 300px';

type ProductCardImageData = ShopProductListItemData & {
  imgSrcSet?: string;
  imgSizes?: string;
  images?: Array<{
    url: string;
    srcSet?: string;
    sizes?: string;
    originalUrl?: string;
  }>;
};

const CANONICAL_BRAND_MAP: Record<string, string> = {
  celimax: 'CELIMAX',
  'mary&may': 'MARY&MAY',
  'mary & may': 'MARY&MAY',
  'beauty of joseon': 'BEAUTY OF JOSEON',
};

const normalizeBrandName = (brand?: string) => {
  const raw = brand?.trim();
  if (!raw) return undefined;

  const lower = raw.toLocaleLowerCase('tr-TR');
  return CANONICAL_BRAND_MAP[lower] ?? raw.toLocaleUpperCase('tr-TR');
};

const ProductCard = ({ data, sizes }: ShopProductCardProps) => {
  const router = useRouter();
  const imageData = data as ProductCardImageData;
  const isMobileApp = useIsMobileApp();
  const smUp = useScreen('smUp');
  const { handleAddItem } = useContext(ShopContext);
  const { isAuthenticated, openAuthenticator } = useAuth();
  const { isFavorite, isFavoriteLoading, toggleFavorite } = useFavorites();
  const [isNavigatingToDetails, setIsNavigatingToDetails] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [productDetail, setProductDetail] = useState<ShopProductData | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [favoriteFeedback, setFavoriteFeedback] = useState<{
    open: boolean;
    title: string;
    variant: BannerVariant;
  }>({
    open: false,
    title: '',
    variant: 'success',
  });
  const [showAdded, setShowAdded] = useState(false);
  const [showSecondaryImage, setShowSecondaryImage] = useState(false);
  const [shouldLoadSecondaryImage, setShouldLoadSecondaryImage] = useState(false);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;
  const isOutOfStock = typeof data.quantity === 'number' && data.quantity <= 0;
  const secondaryImage = imageData.images?.[1]?.url;
  const hasSecondaryImage = Boolean(secondaryImage && secondaryImage !== data.imgSrc);

  // next/image loader'i CDN donusumunu kendisi kuruyor, bu yuzden ham yol
  // tercih ediliyor. `originalUrl` yoksa hazir URL de calisir: loader mevcut
  // `/cdn-cgi/image/...` sarmalini soyup yenisini kuruyor (bkz. imageLoader).
  const primarySrc = imageData.images?.[0]?.originalUrl || data.imgSrc;
  const secondarySrc = imageData.images?.[1]?.originalUrl || secondaryImage;

  // Izgara kolonlariyla ayni kirilma noktalari; yanlis olursa tarayici yanlis
  // adayi secer (aday listesini budamaktan cok daha onemli).
  const cardSizes = sizes ?? DEFAULT_CARD_SIZES;
  const isTopRated = (data.rating?.averageRating ?? 0) >= 4.5 && (data.rating?.totalCount ?? 0) >= 50;
  const productTag = normalizeBrandName(data.brand);
  const favorited = isFavorite(data.id);
  const favoriteLoading = isFavoriteLoading(data.id);

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    };
  }, []);

  const triggerAddedFeedback = () => {
    if (!smUp) return;
    setShowAdded(true);
    if (addedTimeoutRef.current) clearTimeout(addedTimeoutRef.current);
    addedTimeoutRef.current = setTimeout(() => setShowAdded(false), 1200);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setQuickAddLoading(true);

    try {
      const detail = await fetchProductData(data.id);

      if (!detail) {
        setQuickAddLoading(false);
        return;
      }

      if (detail.quantity <= 0) {
        showFavoriteFeedback('Ürün stokta yok', 'error');
        setQuickAddLoading(false);
        return;
      }

      // Liste verisinden hasVariant kontrolü (modal açmadan önce)
      // Eğer liste verisinde hasVariant false ise direkt ekle
      if (!data.hasVariant) {
        const success = handleAddItem({ ...detail, quantity: 1 });
        if (success) {
          if (smUp) {
            triggerAddedFeedback();
          } else {
            setSnackbarOpen(true);
          }
        }
        setQuickAddLoading(false);
        return;
      }

      // Varyant varsa modal'ı göster
      setProductDetail(detail);
      setQuickAddOpen(true);
    } catch (error) {
      console.error('Quick add error:', error);
    } finally {
      setQuickAddLoading(false);
    }
  };

  const handleCloseQuickAdd = () => {
    setQuickAddOpen(false);
    setProductDetail(null);
  };

  const handleMouseEnterImage = () => {
    if (!hasSecondaryImage) return;
    setShouldLoadSecondaryImage(true);
    setShowSecondaryImage(true);
  };

  const showFavoriteFeedback = (title: string, variant: BannerVariant) =>
    setFavoriteFeedback({ open: true, title, variant });

  const runToggleFavorite = async () => {
    const result = await toggleFavorite(data.id);

    if (result.ok) {
      showFavoriteFeedback(result.isFavorite ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', 'success');
      return;
    }

    if (result.unauthorized) {
      openAuthenticator();
      return;
    }

    showFavoriteFeedback(result.error ?? 'Favori işlemi başarısız oldu', 'error');
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated !== true) {
      openAuthenticator();
      return;
    }

    void runToggleFavorite();
  };

  return (
    <>
      <Link
        href={data.url}
        className="block h-full w-full text-inherit"
        target="_self"
        onClick={() => setIsNavigatingToDetails(true)}
      >
        <Card className="h-full cursor-pointer gap-2 border-0 bg-white pb-2.5 text-text transition-transform duration-200 hover:-translate-y-px motion-reduce:transform-none motion-reduce:transition-none">
          <div
            className="relative mb-0.5 aspect-[0.8] w-full overflow-hidden bg-white sm:aspect-square"
            onMouseEnter={handleMouseEnterImage}
            onMouseLeave={() => hasSecondaryImage && setShowSecondaryImage(false)}
          >
            {isMobileApp && isNavigatingToDetails && (
              <div className="absolute inset-0 z-[4] flex items-center justify-center bg-[#dedede50]">
                <div className="rounded-full bg-bg p-2">
                  <Spinner className="text-primary" />
                </div>
              </div>
            )}
            <div className="absolute top-0 right-2.5 left-0 z-[3] flex items-center justify-between sm:top-2.5 sm:left-2.5">
              <div className="flex flex-col gap-1">
                {isOutOfStock && <span className="hidden w-fit rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold tracking-[0.02em] text-text-medium-light sm:flex">TÜKENDİ</span>}
                {isTopRated && <span className="w-fit rounded-full bg-primary px-2.5 py-[3px] text-[11px] font-bold tracking-[0.02em] text-primary-contrast-text sm:px-3 sm:py-1">EN İYİ</span>}
                {hasDiscount && (
                  <span className="w-fit rounded-full border border-accentRed-light bg-white/[88%] px-2.5 py-1 text-[11px] font-bold tracking-[0.02em] text-accentRed-dark shadow-[0_4px_14px_rgba(90,8,13,0.1)] backdrop-blur-md sm:px-3">
                    {smUp ? `%${discountPercent} İNDİRİM` : `-%${discountPercent}`}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleFavoriteClick}
                disabled={favoriteLoading}
                aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                className={cn('mr-[-4px] inline-flex size-9 appearance-none items-center justify-center border-0 bg-transparent text-text-medium transition-all hover:-translate-y-px hover:text-text disabled:text-text-light', favorited && 'text-accentRed')}
              >
                {favoriteLoading ? (
                  <Spinner size={20} className="text-primary" />
                ) : (
                  <Heart size={32} className={cn('transition-colors', favorited && 'fill-current text-accentRed')} />
                )}
              </button>
            </div>
            {primarySrc && (
              <NextImage
                src={primarySrc}
                alt={data.name}
                fill
                sizes={cardSizes}
                loading="lazy"
                style={{
                  objectFit: 'contain',
                  transition: 'opacity 220ms ease',
                  opacity: hasSecondaryImage && showSecondaryImage ? 0 : 1,
                }}
              />
            )}
            {hasSecondaryImage && shouldLoadSecondaryImage && secondarySrc && (
              <NextImage
                src={secondarySrc}
                alt={data.name}
                fill
                sizes={cardSizes}
                loading="lazy"
                style={{
                  objectFit: 'contain',
                  zIndex: 1,
                  transition: 'opacity 220ms ease',
                  opacity: showSecondaryImage ? 1 : 0,
                }}
              />
            )}
          </div>
          <div className="grid content-start gap-y-1">
            {productTag && <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.06em] text-text-medium-light uppercase">{productTag}</p>}
            <p className="line-clamp-2 min-h-[42px] text-[15px] leading-[1.4] font-semibold break-words text-text">
              {data.name}
            </p>
            {data.rating && (
              <div className="flex items-center gap-1 pt-[3px]">
                <span className="text-xs leading-none font-bold text-text">{data.rating.averageRating.toFixed(1)}</span>
                <Rating value={data.rating?.averageRating ?? 0} className="text-[13px]" />
                <span className="text-[11px] leading-none text-text-medium-light">
                  {data.rating.totalCount} Yorum
                </span>
              </div>
            )}
          </div>
          <div className="mt-auto flex min-h-12 flex-wrap content-start items-center gap-1 rounded-lg py-1 sm:min-h-[52px]">
            {hasDiscount && (
              <span className="text-sm leading-[1.2] text-text-medium line-through">
                {formatPrice(data.price.originalPrice, data.price.currency)}
              </span>
            )}
            <span className="text-[17px] leading-[1.15] font-bold text-text sm:text-lg">
              {formatPrice(data.price.currentPrice, data.price.currency)}
            </span>

            {/* Sepete Ekle Icon Button */}
          </div>
          <div>
            <Button
              onClick={
                isOutOfStock
                  ? (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(data.url);
                    }
                  : (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAdd(e);
                    }
              }
              disabled={!isOutOfStock && (quickAddLoading || showAdded)}
              size="small"
              variant={isOutOfStock ? 'outlined' : 'contained'}
              color="primary"
              fullWidth
              className={cn(
                'mt-0.5 rounded-none normal-case sm:h-[46px] sm:px-6 sm:py-2 sm:text-base',
                isOutOfStock && 'bg-transparent hover:bg-text hover:text-white',
                showAdded && 'border-success bg-success text-success-contrast-text hover:border-success hover:bg-success disabled:border-success disabled:bg-success disabled:text-success-contrast-text',
              )}
            >
              {isOutOfStock ? (
                'Gelince Haber Ver'
              ) : quickAddLoading ? (
                <Spinner size={16} />
              ) : smUp ? (
                <CrossFade
                  components={[
                    {
                      in: showAdded,
                      component: (
                        <span className="inline-flex items-center gap-2">
                          <Check size={16} />
                          Eklendi
                        </span>
                      ),
                    },
                    { in: !showAdded, component: 'Sepete Ekle' },
                  ]}
                />
              ) : (
                'Sepete Ekle'
              )}
            </Button>
          </div>
        </Card>
      </Link>

      {/* Quick Add Modal */}
      <QuickAddModal
        open={quickAddOpen}
        onClose={handleCloseQuickAdd}
        product={productDetail}
        loading={quickAddLoading}
      />

      {/* Success Snackbar */}
      <Toast
        open={snackbarOpen}
        duration={2000}
        onClose={() => setSnackbarOpen(false)}
        position="bottom-center"
      >
        <Banner variant="success" title="Ürün sepete eklendi" />
      </Toast>

      <Toast
        open={favoriteFeedback.open}
        duration={2000}
        onClose={() => setFavoriteFeedback((prev) => ({ ...prev, open: false }))}
        position="bottom-center"
      >
        <Banner variant={favoriteFeedback.variant} title={favoriteFeedback.title} />
      </Toast>
    </>
  );
};

export const ProductCardSkeleton = () => {
  // ADR-0002 Faz 2 (F2.1): iskelet kısmı Tailwind'e alındı.
  // Dosyanın geri kalanı hâlâ MUI — Faz 4/5'te dönüşecek.
  return (
    <UiStack gap={1}>
      <UiStack className="aspect-[0.67]">
        <UiSkeleton variant="rounded" height="100%" />
      </UiStack>
      <UiStack className="gap-[2px]">
        <UiSkeleton width={100} className="text-[15px] leading-[20px]" />
        <UiSkeleton className="text-[15px] leading-[20px]" />
        <UiSkeleton width={150} className="text-[15px] leading-[20px]" />
      </UiStack>
      <UiSkeleton width={80} className="text-[15px] leading-[20px]" />
    </UiStack>
  );
};

export default ProductCard;
