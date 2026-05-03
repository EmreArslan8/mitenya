'use client';

import Banner from '@/components/common/Banner';
import Button from '@/components/common/Button';
import { CrossFade } from '@/components/common/CrossFade';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import { trackViewContent, onMetaPixelReady } from '@/lib/analytics/metaPixel';
import { trackTikTokViewContent, trackTikTokWithUser } from '@/lib/analytics/tiktokPixel';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import formatPrice from '@/lib/utils/formatPrice';
import { Box, Skeleton, Snackbar, Stack, Typography } from '@mui/material';
import { Check, Truck, Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ProductDescription from '../ProductDescription';
import ProductSizeGuide from '../ProductSizeGuide';
import ProductStickyBar from '../ProductStickyBar';
import ProductVariants from '../ProductVariants';
import { useLiveProductData } from '../../hooks/useLiveProductData';
import useStyles from '../../styles';

const MAX_CART_QUANTITY = 5;

const ProductPurchaseIsland = ({ data }: { data: ShopProductData }) => {
  const { isCartReady, handleAddItem, getItemQuantity } = useContext(ShopContext);
  const { customerData, isAuthenticated, isGuest, openAuthenticator } = useAuth();
  const router = useRouter();
  const styles = useStyles();
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tikTokUserRef = useRef<{ email?: string; phone?: string }>();
  const [variants, setVariants] = useState(data.variants);
  const [showCheck, setShowCheck] = useState(false);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(true);
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [stockAlertRequested, setStockAlertRequested] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; variant: 'success' | 'error' } | null>(null);
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
  const {
    price,
    quantity,
    stockStatus,
    isLoading: isLiveLoading,
    isLive,
    error: liveError,
  } = useLiveProductData(String(data.id ?? ''), initialLiveData);
  const isLiveReady = isLive && !isLiveLoading && !liveError;

  const hasDiscount = price.originalPrice > price.currentPrice;
  const isOutOfStock = typeof quantity === 'number' && quantity <= 0;
  const stockStatusConfig =
    stockStatus === 'in_stock'
      ? { label: 'Stokta var', color: 'success.main' }
      : stockStatus === 'low_stock'
        ? { label: 'Tükenmek üzere, hemen sipariş edin', color: 'warning.main' }
        : stockStatus === 'out_of_stock'
          ? { label: 'Stokta yok', color: 'error.main' }
          : undefined;
  const discountPercent = hasDiscount ? getDiscountPercent(price) : 0;
  const fullName = data.name ?? '';
  const expirationDate =
    data.attributes?.find((attribute) => {
      const normalizedName = attribute.name
        ?.toLocaleLowerCase('tr-TR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

      return [
        'son kullanma tarihi',
        'son kullanma tarihi skt',
        'skt',
        'expiration date',
        'expiry date',
      ].includes(normalizedName);
    })?.value?.trim() ?? '';
  const isVariantSelectionMissing = !!variants?.length && variants.every((v) => v.options.every((o) => !o.selected));
  const isOverCartLimit = getItemQuantity(data) >= MAX_CART_QUANTITY;
  const buyNowDisabled = !isLiveReady || showCheck || isOutOfStock || isOverCartLimit || isVariantSelectionMissing;
  const addToCartDisabled =
    !isLiveReady || showCheck || (isOutOfStock ? stockAlertRequested : isOverCartLimit || isVariantSelectionMissing);
  const addToCartLoading = isLiveLoading || (!isOutOfStock && !isCartReady) || stockAlertLoading;
  const shouldShowStickyBar = isLiveReady && !isOutOfStock && !isMainCtaVisible;

  const handleSelectOption = (variantName: string, optionValue: string) => {
    setVariants((prev) =>
      prev?.map((v) =>
        variantName === v.name
          ? {
            ...v,
            options: v.options.map((o) => (o.value === optionValue ? { ...o, selected: true } : { ...o, selected: false })),
          }
          : v
      )
    );
  };

  const handleAddToCart = () => {
    if (!isLiveReady) return;
    const success = handleAddItem({ ...data, price, quantity, stockStatus, variants });
    if (!success) return;
    setShowCheck(true);
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => setShowCheck(false), 1000);
  };

  const handleBuyNow = () => {
    if (!isLiveReady || isOutOfStock) return;
    const success = handleAddItem({ ...data, price, quantity, stockStatus, variants });
    if (!success) return;
    router.push('/checkout');
  };

  const getSelectedVariant = () => {
    const selected = variants
      ?.map((variant) => {
        const selectedOption = variant.options.find((option) => option.selected);
        if (!selectedOption) return null;
        return `${variant.name}: ${selectedOption.value}`;
      })
      .filter(Boolean);

    return selected?.join(' | ') ?? '';
  };

  const subscribeStockAlert = async () => {
    if (!isLiveReady || stockAlertLoading || stockAlertRequested) return;

    try {
      setStockAlertLoading(true);
      const selectedVariant = getSelectedVariant();
      const res = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.id,
          productName: fullName,
          productUrl: window.location.href,
          variantName: selectedVariant ? 'selected' : '',
          variantValue: selectedVariant,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          json?.error?.message ??
          json?.error ??
          'Stok bildirimi talebi su an olusturulamadi';
        throw new Error(message);
      }

      setStockAlertRequested(true);
      setFeedback({ title: 'Stok bildirimi talebiniz alindi', variant: 'success' });
    } catch {
      setFeedback({ title: 'Stok bildirimi talebi olusturulamadi', variant: 'error' });
    } finally {
      setStockAlertLoading(false);
    }
  };

  const withAuth = (cb: () => void) => {
    if (isAuthenticated && !isGuest) {
      cb();
      return;
    }
    openAuthenticator?.({ onSuccess: cb });
  };

  useEffect(() => {
    tikTokUserRef.current = {
      email: customerData?.email,
      phone: customerData?.phone,
    };
  }, [customerData?.email, customerData?.phone]);

  useEffect(() => {
    const cleanupMeta = onMetaPixelReady(() => {
      trackViewContent({
        content_ids: [String(data.id)],
        content_name: data.name,
        content_category: data.category,
        value: data.price.currentPrice,
        currency: data.price.currency ?? 'TRY',
      });
    });
    const cleanupTikTok = trackTikTokWithUser({
      userData: tikTokUserRef.current,
      track: () => trackTikTokViewContent({
        content_ids: [String(data.id)],
        content_name: data.name,
        content_category: data.category,
        value: data.price.currentPrice,
        currency: data.price.currency ?? 'TRY',
      }),
    });

    return () => {
      cleanupMeta();
      cleanupTikTok();
    };
  }, [data.category, data.id, data.name, data.price.currency, data.price.currentPrice]);

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const target = ctaRowRef.current;
    if (!target) {
      setIsMainCtaVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = Boolean(entry?.isIntersecting);
        setIsMainCtaVisible((prev) => (prev === nextVisible ? prev : nextVisible));
      },
      { root: null, threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {!isLiveReady && (
        <Stack direction="row" alignItems="center" gap={0.8} sx={styles.stockRow}>
          <Box sx={{ ...styles.stockPulseDot, bgcolor: liveError ? 'error.main' : 'warning.main' }} />
          <Typography
            variant="body2"
            sx={{ color: liveError ? 'error.main' : 'warning.main', fontWeight: 600, fontSize: { xs: 15, sm: 16 } }}
          >
            {liveError ? 'Fiyat ve stok su an dogrulanamiyor' : 'Fiyat ve stok kontrol ediliyor'}
          </Typography>
        </Stack>
      )}
      {isLiveReady && stockStatusConfig && (
        <Stack direction="row" alignItems="center" gap={0.8} sx={styles.stockRow}>
          <Box sx={{ ...styles.stockPulseDot, bgcolor: stockStatusConfig.color }} />
          <Typography
            variant="body2"
            sx={{ color: stockStatusConfig.color, fontWeight: 600, fontSize: { xs: 15, sm: 16 } }}
          >
            {stockStatusConfig.label}
          </Typography>
        </Stack>
      )}
      {isLiveReady ? (
        <Stack sx={styles.priceContainer}>
          {hasDiscount && (
            <Typography sx={styles.originalPrice}>
              {formatPrice(price.originalPrice, price.currency)}
            </Typography>
          )}
          <Typography variant="infoValue" sx={styles.currentPrice}>
            {formatPrice(price.currentPrice, price.currency)}
          </Typography>
          {hasDiscount && <Stack sx={styles.discountBadge}>{`%${discountPercent} İndirim`}</Stack>}
        </Stack>
      ) : (
        <Stack sx={styles.priceContainer}>
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="text" width={210} height={56} />
        </Stack>
      )}
      {variants && (
        <ProductVariants
          variants={variants}
          onSelect={handleSelectOption}
          productId={data.id}
        />
      )}
      {(data.sizeRecommendation || data.sizeGuide) && (
        <ProductSizeGuide
          sizeRecommendation={data.sizeRecommendation}
          sizeGuide={data.sizeGuide}
        />
      )}
      <Stack sx={styles.ctaRow} ref={ctaRowRef}>
        {!isOutOfStock && (
          <Button
            variant="outlined"
            loading={!isCartReady}
            disabled={buyNowDisabled}
            onClick={handleBuyNow}
            sx={styles.buyNowButton}
          >
            Hemen Al
          </Button>
        )}
        <Button
          variant="contained"
          loading={addToCartLoading}
          disabled={addToCartDisabled}
          onClick={isOutOfStock ? () => withAuth(() => void subscribeStockAlert()) : handleAddToCart}
          sx={styles.ctaButton}
        >
          <CrossFade
            components={[
              {
                in: showCheck,
                component: (
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Check />
                    Eklendi
                  </Stack>
                ),
              },
              {
                in: !showCheck,
                component: isOutOfStock
                  ? stockAlertRequested
                    ? 'Bildirim Talebiniz Alindi'
                    : 'Bu ürün stokta oldugunda bana bildir'
                  : 'Sepete Ekle',
              },
            ]}
          />
        </Button>
      </Stack>
      <Stack sx={styles.trustCard}>
        <Stack sx={styles.trustSignal}>
          <Box sx={styles.trustSignalIcon}>
            <Truck size={18} strokeWidth={2} />
          </Box>
          <Box sx={styles.trustSignalContent}>
            <Typography sx={styles.trustSignalTitle}>Aynı Gün Kargo</Typography>
            <Typography sx={styles.trustSignalText}>
              Saat 15:00&apos;e kadar verilen siparişler aynı gün kargoda.
            </Typography>
          </Box>
        </Stack>
        <Stack sx={styles.trustSignal}>
          <Box sx={styles.trustSignalIcon}>
            <Undo2 size={18} strokeWidth={2} />
          </Box>
          <Box sx={styles.trustSignalContent}>
            <Typography sx={styles.trustSignalTitle}>Kolay İade & Değişim</Typography>
            <Typography sx={styles.trustSignalText}>
              14 gün içinde kolay iade ve değişim imkanı.
            </Typography>
          </Box>
        </Stack>
      </Stack>
      {expirationDate ? (
        <Stack sx={styles.expirationBox}>
          <Typography sx={styles.expirationEyebrow}>
            Kullanım Bilgisi
          </Typography>
          <Stack sx={styles.expirationRows}>
            <Stack sx={styles.expirationRow}>
              <Box sx={styles.expirationDot} />
              <Typography sx={styles.expirationItem}>
                <Typography component="span" sx={styles.expirationLabel}>
                  Son Kullanma Tarihi:
                </Typography>{' '}
                {expirationDate}
              </Typography>
            </Stack>
            <Stack sx={styles.expirationRow}>
              <Box sx={styles.expirationDot} />
              <Typography sx={styles.expirationItem}>
                Açıldıktan sonra <Typography component="span" sx={styles.expirationLabel}>6 Ay</Typography> içinde tüketilmesi önerilir.
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      ) : null}
      {data.description && (
        <ProductDescription description={data.description} />
      )}
      <ProductStickyBar
        imgSrc={data.imgSrc ?? data.images?.[0]}
        name={data.name}
        price={price}
        visible={shouldShowStickyBar}
        disabled={addToCartDisabled}
        loading={addToCartLoading}
        showCheck={showCheck}
        onAddToCart={handleAddToCart}
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

export default ProductPurchaseIsland;
