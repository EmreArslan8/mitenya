'use client';

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
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ShopContext } from '@/contexts/ShopContext';
import {
  CircularProgress,
  IconButton,
  Rating,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Check, Heart } from 'lucide-react';
import { useEffect, useRef, useState, useContext } from 'react';
import useStyles from './styles';
import Button from '../common/Button';
import type { BannerVariant } from '../common/Banner';

interface ShopProductCardProps {
  data: ShopProductListItemData;
}

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

const ProductCard = ({ data }: ShopProductCardProps) => {
  const isMobileApp = useIsMobileApp();
  const { smUp } = useScreen();
  const styles = useStyles();
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
  const secondaryImage = data.images?.[1]?.url;
  const hasSecondaryImage = Boolean(secondaryImage && secondaryImage !== data.imgSrc);
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
      openAuthenticator({
        onSuccess: () => {
          void runToggleFavorite();
        },
      });
      return;
    }

    showFavoriteFeedback(result.error ?? 'Favori işlemi başarısız oldu', 'error');
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated !== true) {
      openAuthenticator({
        onSuccess: () => {
          void runToggleFavorite();
        },
      });
      return;
    }

    void runToggleFavorite();
  };

  return (
    <>
      <Link
        href={data.url}
        style={styles.link}
        target="_self"
        onClick={() => setIsNavigatingToDetails(true)}
      >
        <Card sx={styles.card}>
          <Stack
            sx={styles.imageContainer}
            onMouseEnter={handleMouseEnterImage}
            onMouseLeave={() => hasSecondaryImage && setShowSecondaryImage(false)}
          >
            {isMobileApp && isNavigatingToDetails && (
              <Stack sx={styles.imageLoadingOverlay}>
                <Stack sx={styles.imageLoadingProgressContainer}>
                  <CircularProgress />
                </Stack>
              </Stack>
            )}
            <Stack sx={styles.badgeList}>
              {isTopRated && <Stack sx={{ ...styles.badge, ...styles.badgeBest }}>EN IYI</Stack>}
              {hasDiscount && <Stack sx={{ ...styles.badge, ...styles.badgeDiscount }}>{`%${discountPercent} INDIRIM`}</Stack>}
            </Stack>
            <IconButton
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
              aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              sx={{
                ...styles.favoriteButton,
                ...(favorited ? styles.favoriteButtonActive : {}),
              }}
            >
              {favoriteLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Heart size={32} style={favorited ? styles.favoriteIconActive : styles.favoriteIcon} />
              )}
            </IconButton>
            <img
              src={data.imgSrc}
              alt={data.name}
              loading="lazy"
              decoding="async"
              style={{
                ...styles.image,
                opacity: hasSecondaryImage && showSecondaryImage ? 0 : 1,
              }}
            />
            {hasSecondaryImage && shouldLoadSecondaryImage && (
              <img
                src={secondaryImage}
                alt={data.name}
                loading="lazy"
                decoding="async"
                style={{
                  ...styles.image,
                  ...styles.imageSecondary,
                  opacity: showSecondaryImage ? 1 : 0,
                }}
              />
            )}
          </Stack>
          <Stack sx={styles.infoContainer}>
            {productTag && <Typography sx={styles.subtitle}>{productTag}</Typography>}
            <Typography variant="warning" sx={styles.productName}>
              {data.name}
            </Typography>
            {data.rating && (
              <Stack sx={styles.rating}>
                <Typography sx={styles.ratingValue}>{data.rating.averageRating.toFixed(1)}</Typography>
                <Rating
                  readOnly
                  value={data.rating?.averageRating}
                  precision={0.1}
                  sx={styles.ratingStars}
                />
                <Typography variant="body" sx={styles.ratingCount}>
                  {data.rating.totalCount} Yorum
                </Typography>
              </Stack>
            )}
          </Stack>
          <Stack sx={styles.priceContainer}>
            {hasDiscount && (
              <Typography sx={styles.originalPrice}>
                {formatPrice(data.price.originalPrice, data.price.currency)}
              </Typography>
            )}
            <Typography variant="infoValue" sx={styles.price}>
              {formatPrice(data.price.currentPrice, data.price.currency)}
            </Typography>

            {/* Sepete Ekle Icon Button */}
          </Stack>
          <Stack>
            <Button
              onClick={
                isOutOfStock
                  ? undefined
                  : (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAdd(e);
                    }
              }
              disabled={isOutOfStock || quickAddLoading || showAdded}
              size="medium"
              variant="contained"
              sx={{
                ...styles.addToCartButton,
                ...(showAdded ? styles.addToCartButtonAdded : {}),
              }}
            >
              {isOutOfStock ? (
                'Stokta yok'
              ) : quickAddLoading ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : smUp ? (
                <CrossFade
                  components={[
                    {
                      in: showAdded,
                      component: (
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Check size={16} />
                          Eklendi
                        </Stack>
                      ),
                    },
                    { in: !showAdded, component: 'Sepete Ekle' },
                  ]}
                />
              ) : (
                'Sepete Ekle'
              )}
            </Button>
          </Stack>
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Banner variant="success" title="Ürün sepete eklendi" sx={{ width: '100%' }} />
      </Snackbar>

      <Snackbar
        open={favoriteFeedback.open}
        autoHideDuration={2000}
        onClose={() => setFavoriteFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Banner variant={favoriteFeedback.variant} title={favoriteFeedback.title} sx={{ width: '100%' }} />
      </Snackbar>
    </>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <Stack gap={1}>
      <Stack sx={{ aspectRatio: 0.67 }}>
        <Skeleton variant="rounded" height="100%" />
      </Stack>
      <Stack gap="2px">
        <Skeleton width={100} sx={{ fontSize: 15, lineHeight: '20px' }} />
        <Skeleton sx={{ fontSize: 15, lineHeight: '20px' }} />
        <Skeleton width={150} sx={{ fontSize: 15, lineHeight: '20px' }} />
      </Stack>
      <Skeleton width={80} sx={{ fontSize: 15, lineHeight: '20px' }} />
    </Stack>
  );
};

export default ProductCard;
