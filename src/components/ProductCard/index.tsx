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
import { ShopContext } from '@/contexts/ShopContext';
import {
  CircularProgress,
  IconButton,
  Rating,
  Skeleton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState, useContext } from 'react';
import useStyles from './styles';
import Button from '../common/Button';

interface ShopProductCardProps {
  data: ShopProductListItemData;
}

const ProductCard = ({ data }: ShopProductCardProps) => {
  const isMobileApp = useIsMobileApp();
  const { smUp } = useScreen();
  const styles = useStyles();
  const { handleAddItem } = useContext(ShopContext);
  const [isNavigatingToDetails, setIsNavigatingToDetails] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [productDetail, setProductDetail] = useState<ShopProductData | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const addedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;

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

  return (
    <>
      <Link
        href={data.url}
        style={styles.link}
        target={isMobileApp ? '_self' : '_blank'}
        onClick={() => setIsNavigatingToDetails(true)}
      >
        <Card sx={styles.card}>
          <Stack sx={styles.imageContainer}>
            {isMobileApp && isNavigatingToDetails && (
              <Stack sx={styles.imageLoadingOverlay}>
                <Stack sx={styles.imageLoadingProgressContainer}>
                  <CircularProgress />
                </Stack>
              </Stack>
            )}
            {hasDiscount && <Stack sx={styles.discountBadge}>{`-${discountPercent}%`}</Stack>}
            <img src={data.imgSrc} alt={data.name} style={styles.image} />
          </Stack>
          <Stack>
            <Typography variant="warning" sx={styles.productName}>
              <Typography variant="warningSemibold" sx={styles.brand}>
                {data.brand}{' '}
              </Typography>
              {data.name}
            </Typography>
            {data.rating && (
              <Stack sx={styles.rating}>
                <Rating
                  readOnly
                  value={data.rating?.averageRating}
                  precision={0.1}
                  sx={{ fontSize: 12 }}
                />
                <Typography variant="body" sx={styles.ratingCount}>
                  ({data.rating.totalCount})
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
              onClick={handleQuickAdd}
              disabled={quickAddLoading || showAdded}
              size="small"
              variant="contained"
            >
              {quickAddLoading ? (
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
