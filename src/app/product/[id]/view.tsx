'use client';

import { useEffect, useState, useRef, useContext } from 'react';
import Button from '@/components/common/Button';
import Banner from '@/components/common/Banner';
import Card from '@/components/common/Card';
import { CrossFade } from '@/components/common/CrossFade';
import Link from '@/components/common/Link';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { Box, Divider, Grid, Rating, Snackbar, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import ProductAttributes from './components/ProductAttributes';
import ProductFaq from './components/ProductFaq';
import ProductFeatures from './components/ProductFeatures';
import ProductRecommendations from './components/ProductRecommendations';
import ProductReviews from './components/ProductReviews';
import ProductSizeGuide from './components/ProductSizeGuide';
import ProductVariants from './components/ProductVariants';
import ProgressIndicator from './components/ProgressIndicator';
import useStyles from './styles';
import formatPrice from '@/lib/utils/formatPrice';
import { Check, ChevronRight, SquareArrowOutUpRight } from 'lucide-react';
import ProductImageMagnifier from './components/ProductImageMagnifier';
import ProductDescription from './components/ProductDescription';

const ProductPageView = ({ data }: { data: ShopProductData }) => {
  const { isCartReady, handleAddItem, getItemQuantity } = useContext(ShopContext);
  const { isAuthenticated, openAuthenticator } = useAuth();
  const router = useRouter();
  const styles = useStyles();
  const { smUp } = useScreen();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [currentImg, setCurrentImg] = useState(data.imgSrc);
  const [variants, setVariants] = useState(data.variants);
  const [showCheck, setShowCheck] = useState(false);
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [stockAlertRequested, setStockAlertRequested] = useState(false);
  const [stockAlertMessage, setStockAlertMessage] = useState<string | undefined>();
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const isOutOfStock = typeof data.quantity === 'number' && data.quantity <= 0;
  const stockStatusConfig =
    data.stockStatus === 'in_stock'
      ? { label: 'Stokta var, şimdi sipariş verin; aynı gün kargoya hazırlayalım.', color: 'success.main' }
      : data.stockStatus === 'low_stock'
        ? { label: 'Tükenmek üzere, hemen sipariş edin', color: 'warning.main' }
        : data.stockStatus === 'out_of_stock'
          ? { label: 'Şu an stokta yok, stok gelince ilk siz haberdar olun.', color: 'error.main' }
          : undefined;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;
  const brandLabel = data.brand?.trim();
  const brandSearchToken = data.brandSlug ?? (data.brandId?.toString() === '2' ? 'zara' : data.brandId);
  const brandHref = brandSearchToken
    ? searchUrlFromOptions({ brand: brandSearchToken })
    : undefined;
  const categoryLabel = data.category?.trim();
  const categorySearchToken = data.categorySlug ?? data.categoryId;
  const categoryHref = categorySearchToken
    ? searchUrlFromOptions({ category: categorySearchToken })
    : undefined;
  const fullName = data.name ?? '';
  const handleSelectOption = (variantName: string, optionValue: string) => {
    setVariants((prev) =>
      prev?.map((v) =>
        variantName === v.name
          ? {
            ...v,
            options: v.options.map((o) => {
              if (o.value === optionValue) {
                return { ...o, selected: true };
              } else return { ...o, selected: false };
            }),
          }
          : v
      )
    );
  };

  const handleAddToCart = () => {
    const success = handleAddItem({ ...data, variants: variants });
    if (!success) return;
    setShowCheck(true);
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => setShowCheck(false), 1000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const success = handleAddItem({ ...data, variants: variants });
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
    if (stockAlertLoading || stockAlertRequested) return;

    try {
      setStockAlertLoading(true);

      const selectedVariant = getSelectedVariant();
      const res = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.id,
          productName: fullName,
          productUrl: typeof window !== 'undefined' ? window.location.href : undefined,
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
      setStockAlertMessage('Stok bildirimi talebiniz alindi');
    } catch {
      setStockAlertMessage('Stok bildirimi talebi olusturulamadi');
    } finally {
      setStockAlertLoading(false);
    }
  };

  const handleOutOfStockClick = () => {
    if (isAuthenticated) {
      void subscribeStockAlert();
      return;
    }

    openAuthenticator?.({
      onSuccess: () => {
        void subscribeStockAlert();
      },
    });
  };

  const isDesktop = smUp;

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Stack direction="row" alignItems="center" gap={0.5} sx={styles.breadcrumbs}>
          <Link href="/" prefetch={false}>
            <Typography component="span">Ana Sayfa</Typography>
          </Link>
          {brandLabel ? <ChevronRight size={14} /> : null}
          {brandLabel ? (
            <Link href={brandHref} prefetch={false}>
              <Typography component="span">{brandLabel}</Typography>
            </Link>
          ) : null}
          {categoryLabel ? <ChevronRight size={14} /> : null}
          {categoryLabel ? (
            <Link href={categoryHref} prefetch={false}>
              <Typography component="span" sx={{ fontWeight: 600 }}>{categoryLabel}</Typography>
            </Link>
          ) : null}
        </Stack>
        <Grid container columnSpacing={{ sm: 5 }} rowSpacing={{ xs: 2, sm: 0 }} sx={styles.productContainer}>
          <Grid
            item
            xs={12}
            sm={6}
            sx={styles.imageGridItem}
          >
            {isDesktop ? (
              <Card sx={styles.imageCard}>
                <Grid container columnSpacing={data.images && data.images.length > 1 ? 2 : 0} sx={styles.imageSplitGrid}>
                  {data.images && data.images.length > 1 && (
                    <Grid item xs={2} sx={styles.thumbnailColumn}>
                      <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        scrollButtons
                        value={currentImg}
                        sx={styles.thumbnailsVertical}
                      >
                        {data.images.map((src) => (
                          <Tab
                            label={<img src={src} alt="" style={styles.thumbnailImage} />}
                            value={src}
                            onClick={() => setCurrentImg(src)}
                            sx={styles.thumbnail}
                            key={src}
                          />
                        ))}
                      </Tabs>
                    </Grid>
                  )}
                  <Grid item xs={data.images && data.images.length > 1 ? 10 : 12}>
                    <Box sx={styles.magnifierWrapper}>
                      <ProductImageMagnifier
                        src={currentImg}
                        alt={data.name}
                        zoomLevel={2.5}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            ) : (
              <>
                <Stack sx={styles.mobileImagesContainer}>
                  <Stack sx={styles.mobileImages} ref={scrollerRef}>
                    {data.images?.map((src) => (
                      <Stack sx={styles.mobileImage} key={src}>
                        <img src={src} alt="" style={styles.image} />
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
                {!!data.images?.length && (
                  <Stack sx={styles.progressIndicatorContainer}>
                    <ProgressIndicator scrollerRef={scrollerRef} total={data.images?.length} />
                  </Stack>
                )}
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack sx={styles.details}>
              <Stack gap={1}>
                <Link
                  href={searchUrlFromOptions({
                    brand: brandSearchToken,
                  })}
                  prefetch={false}
                >
                  <Typography component="span" sx={styles.brand}>
                    {data.brand}
                    <SquareArrowOutUpRight size={16} strokeWidth={3} style={{ marginTop: '2px' }} />
                  </Typography>
                </Link>
                <Typography component="h1" variant="h3" sx={styles.productName}>
                  {fullName}
                </Typography>
                {data.rating && (
                  <Stack sx={styles.rating}>
                    <Typography variant="caption" fontWeight={600}>
                      {data.rating.averageRating}
                    </Typography>
                    <Rating
                      readOnly
                      precision={0.1}
                      value={data.rating?.averageRating}
                      sx={{ fontSize: 14 }}
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
                <Typography variant="infoValue" sx={styles.currentPrice}>
                  {formatPrice(data.price.currentPrice, data.price.currency)}
                </Typography>
                {hasDiscount && <Stack sx={styles.discountBadge}>{`-${discountPercent}%`}</Stack>}
              </Stack>
              {stockStatusConfig && (
                <Stack direction="row" alignItems="center" gap={0.8}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: stockStatusConfig.color,
                      flexShrink: 0,
                      animation: 'stockPulse 1.2s ease-in-out infinite',
                      '@keyframes stockPulse': {
                        '0%, 100%': { opacity: 0.3, transform: 'scale(0.9)' },
                        '50%': { opacity: 1, transform: 'scale(1.15)' },
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: stockStatusConfig.color, fontWeight: 600, fontSize: { xs: 15, sm: 16 } }}
                  >
                    {stockStatusConfig.label}
                  </Typography>
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
              <Divider sx={{ my: 1 }} />
              <Stack sx={styles.ctaRow}>
                {!isOutOfStock && (
                  <Button
                    variant="outlined"
                    loading={!isOutOfStock && !isCartReady}
                    disabled={
                      showCheck ||
                      isOutOfStock ||
                      getItemQuantity(data) > 4 ||
                      variants?.every((v) => v.options.every((o) => !o.selected))
                    }
                    onClick={handleBuyNow}
                    sx={styles.buyNowButton}
                  >
                    Hemen Al
                  </Button>
                )}
                <Button
                  variant="contained"
                  loading={(!isOutOfStock && !isCartReady) || stockAlertLoading}
                  disabled={
                    showCheck ||
                    (isOutOfStock
                      ? stockAlertRequested
                      : getItemQuantity(data) > 4 ||
                      variants?.every((v) => v.options.every((o) => !o.selected)))
                  }
                  onClick={isOutOfStock ? handleOutOfStockClick : handleAddToCart}
                  sx={styles.ctaButton}
                >
                  <CrossFade
                    components={[
                      {
                        in: showCheck,
                        component: isDesktop ? (
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Check />
                            Eklendi
                          </Stack>
                        ) : (
                          <Check />
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
              {data.attributes && <ProductAttributes attributes={data.attributes} />}
              {data.description && (
                <ProductDescription description={data.description} />
              )}
              <ProductFeatures />
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      <ProductFaq faqs={data.faqs} />
      <ProductReviews
        productId={data.id}
        initialReviews={data.reviews ?? []}
        initialRating={data.rating}
      />
      {data.brandId && <ProductRecommendations brandId={data.brandId} productId={data.id} />}

      <Snackbar
        open={!!stockAlertMessage}
        autoHideDuration={3000}
        onClose={() => setStockAlertMessage(undefined)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Banner
          variant={stockAlertRequested ? 'success' : 'error'}
          title={stockAlertMessage}
        />
      </Snackbar>
    </Stack>
  );
};

export default ProductPageView;
