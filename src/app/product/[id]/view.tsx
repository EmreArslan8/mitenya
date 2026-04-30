'use client';

import { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import Button from '@/components/common/Button';
import Banner from '@/components/common/Banner';
import { CrossFade } from '@/components/common/CrossFade';
import Link from '@/components/common/Link';
import WelcomeCouponModal from '@/components/WelcomeCouponModal';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopCoupon, ShopProductData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { Box, Divider, Grid, Rating, Snackbar, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import ProductDescription from './components/ProductDescription';
import ProductFaq from './components/ProductFaq';
import ProductImageGalleryClient from './components/ProductImageGallery/ProductImageGalleryClient';
import ProductShopAssistant from './components/ProductShopAssistant';
import ProductRecommendations from './components/ProductRecommendations';
import ProductReviews from './components/ProductReviews';
import ProductSizeGuide from './components/ProductSizeGuide';
import ProductStickyBar from './components/ProductStickyBar';
import ProductVariants from './components/ProductVariants';
import useStyles from './styles';
import formatPrice from '@/lib/utils/formatPrice';
import { Check, ChevronRight, Truck, Undo2 } from 'lucide-react';
import copyTextOnClick from '@/lib/utils/copyTextOnClick';
import {
  onMetaPixelReady,
  trackAddToWishlist,
  trackViewContent,
} from '@/lib/analytics/metaPixel';
import {
  trackTikTokAddToWishlist,
  trackTikTokWithUser,
  trackTikTokViewContent,
} from '@/lib/analytics/tiktokPixel';
import QATypewriterPill from './components/ProductShopAssistant/QATypewriterPill';

const MAX_CART_QUANTITY = 5;

const ProductPageView = ({
  data,
  coupons = [],
  initialGalleryIsDesktop = true,
  pdpBlocksSlot,
}: {
  data: ShopProductData;
  coupons?: ShopCoupon[];
  initialGalleryIsDesktop?: boolean;
  pdpBlocksSlot?: ReactNode;
}) => {
  const { isCartReady, handleAddItem, getItemQuantity } = useContext(ShopContext);
  const { customerData, isAuthenticated, isGuest, openAuthenticator } = useAuth();
  const { isFavorite, isFavoriteLoading, toggleFavorite } = useFavorites();
  const router = useRouter();
  const styles = useStyles();
  const { smUp } = useScreen();
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const tikTokUserRef = useRef<{ email?: string; phone?: string }>();
  const [variants, setVariants] = useState(data.variants);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(true);
  const [showCheck, setShowCheck] = useState(false);
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [stockAlertRequested, setStockAlertRequested] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; variant: 'success' | 'error' } | null>(null);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const isOutOfStock = typeof data.quantity === 'number' && data.quantity <= 0;
  const stockStatusConfig =
    data.stockStatus === 'in_stock'
      ? { label: 'Stokta var', color: 'success.main' }
      : data.stockStatus === 'low_stock'
        ? { label: 'Tükenmek üzere, hemen sipariş edin', color: 'warning.main' }
        : data.stockStatus === 'out_of_stock'
          ? { label: 'Stokta yok', color: 'error.main' }
          : undefined;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;
  const brandLabel = data.brand?.trim();
  const brandSearchToken = data.brandSlug ?? data.brandId;
  const brandHref = brandSearchToken
    ? searchUrlFromOptions({ brand: brandSearchToken })
    : undefined;
  const categoryLabel = data.category?.trim();
  const categorySearchToken = data.categorySlug ?? data.categoryId;
  const categoryHref = categorySearchToken
    ? searchUrlFromOptions({ category: categorySearchToken })
    : undefined;
  const fullName = data.name ?? '';
  const skinTypeBadge =
    data.attributes?.find((attribute) =>
      ['skinType', 'skin_type', 'ciltTipi', 'Cilt Tipi'].includes(attribute.name)
    )?.value?.trim() ?? '';
  const badgeText = skinTypeBadge || categoryLabel || 'Cilt Bakim Urunu';
  const shortDescription = data.shortDescription?.trim() ?? '';
  const shortDescriptionParagraphs = shortDescription
    ? shortDescription
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];
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
  const productId = String(data.id ?? '');
  const isFavorited = productId ? isFavorite(productId) : false;
  const favoriteLoading = productId ? isFavoriteLoading(productId) : false;
  const isVariantSelectionMissing = !!variants?.length && variants.every((v) => v.options.every((o) => !o.selected));
  const isOverCartLimit = getItemQuantity(data) >= MAX_CART_QUANTITY;
  const buyNowDisabled = showCheck || isOutOfStock || isOverCartLimit || isVariantSelectionMissing;
  const addToCartDisabled = showCheck || (isOutOfStock ? stockAlertRequested : isOverCartLimit || isVariantSelectionMissing);
  const addToCartLoading = (!isOutOfStock && !isCartReady) || stockAlertLoading;
  const shouldShowStickyBar = !isOutOfStock && !isMainCtaVisible;
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

  const handleOutOfStockClick = () => {
    withAuth(() => void subscribeStockAlert());
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
          value: data.price.currentPrice,
          currency: data.price.currency ?? 'TRY',
        }),
      });
    }
  };

  const isDesktop = smUp;

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      <WelcomeCouponModal coupons={coupons} placement="product" />
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
            <ProductImageGalleryClient
              imageList={data.images?.length ? data.images : data.imgSrc ? [data.imgSrc] : []}
              mobileGallery={data.galleryImages ?? []}
              baseAlt={data.name?.trim() || 'Urun'}
              initialIsDesktop={initialGalleryIsDesktop}
              name={data.name}
              isFavorited={isFavorited}
              favoriteLoading={favoriteLoading}
              onFavoriteClick={handleFavoriteClick}
              onShareClick={handleShareClick}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack sx={styles.details}>
              <Stack sx={styles.titleBlock}>
                <Link
                  href={searchUrlFromOptions({
                    brand: brandSearchToken,
                  })}
                  prefetch={false}
                >
                  <Typography component="span" sx={styles.brand}>
                    {data.brand}
                  </Typography>
                </Link>
                <Typography component="h1" sx={styles.productName}>
                  {fullName}
                </Typography>
              </Stack>
              {data.rating ? (
                <Stack sx={styles.metaRow}>
                  <Stack sx={{ ...styles.rating, cursor: 'pointer' }} onClick={scrollToReviews}>
                    <Rating
                      readOnly
                      precision={0.1}
                      value={data.rating?.averageRating}
                      sx={{ fontSize: 18 }}
                    />
                    <Typography variant="body" sx={styles.ratingCount}>
                      ({data.rating.totalCount} Yorum)
                    </Typography>
                  </Stack>
                  <Stack sx={styles.ratingSeparator}>
                    <Typography component="span">|</Typography>
                  </Stack>
                </Stack>
              ) : null}
              <Stack sx={styles.summaryBlock}>
                <Stack sx={styles.badgePill}>
                  <Typography component="span" sx={styles.badgePillText}>
                    {badgeText}
                  </Typography>
                </Stack>
                {shortDescriptionParagraphs.length ? (
                  <Stack sx={styles.shortDescriptionBlock}>
                    {shortDescriptionParagraphs.map((paragraph) => (
                      <Typography key={paragraph} sx={styles.shortDescription}>
                        {paragraph}
                      </Typography>
                    ))}
                    <QATypewriterPill />
                  </Stack>
                ) : null}
                <Divider sx={styles.shortDescriptionDivider} />
              </Stack>
              {stockStatusConfig && (
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
              <Stack sx={styles.priceContainer}>
                {hasDiscount && (
                  <Typography sx={styles.originalPrice}>
                    {formatPrice(data.price.originalPrice, data.price.currency)}
                  </Typography>
                )}
                <Typography variant="infoValue" sx={styles.currentPrice}>
                  {formatPrice(data.price.currentPrice, data.price.currency)}
                </Typography>
                {hasDiscount && <Stack sx={styles.discountBadge}>{`%${discountPercent} İndirim`}</Stack>}
              </Stack>
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
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      {pdpBlocksSlot}
      <ProductFaq faqs={data.faqs} productName={fullName} />
      <Box ref={reviewsSectionRef} id="product-reviews">
        <ProductReviews
          productId={data.id}
          initialReviews={data.reviews ?? []}
          initialRating={data.rating}
        />
      </Box>
      {data.brandId && <ProductRecommendations brandId={data.brandId} productId={data.id} />}
      <ProductShopAssistant data={data} />
      <ProductStickyBar
        imgSrc={data.imgSrc ?? data.images?.[0]}
        name={data.name}
        price={data.price}
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
      </Stack>
    </>
  );
};

export default ProductPageView;
