'use client';

import { useEffect, useState, useRef, useContext } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { CrossFade } from '@/components/common/CrossFade';
import Link from '@/components/common/Link';
import Markdown from '@/components/common/Markdown';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopProductData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { Box, Divider, Grid, Rating, Stack, Tab, Tabs, Typography } from '@mui/material';
import ProductAttributes from './components/ProductAttributes';
import ProductFaq from './components/ProductFaq';
import ProductFeatures from './components/ProductFeatures';
import ProductRecommendations from './components/ProductRecommendations';
import ProductReviews from './components/ProductReviews';
import ProductSizeGuide from './components/ProductSizeGuide';
import ProductVariants from './components/ProductVariants';
import ProgressIndicator from './components/ProgressIndicator';
import useStyles from './styles';
import { usePalette } from '@/theme/ThemeRegistry';
import formatPrice from '@/lib/utils/formatPrice';
import { Check, ChevronRight, SquareArrowOutUpRight } from 'lucide-react';
import ProductImageMagnifier from './components/ProductImageMagnifier';

const ProductPageView = ({ data }: { data: ShopProductData }) => {
  const { isCartReady, handleAddItem, getItemQuantity } = useContext(ShopContext);
  const styles = useStyles();
  const { smUp } = useScreen();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const [currentImg, setCurrentImg] = useState(data.imgSrc);
  const [variants, setVariants] = useState(data.variants);
  const [showCheck, setShowCheck] = useState(false);
  const [mounted, setMounted] = useState(false);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const palette = usePalette();
  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;
console.log(data.price, "fiyat ")
console.log('[PALETTE DEBUG]', { accentRed: palette.accentRed, errorContrastText: palette.error?.contrastText, primaryMain: palette.primary?.main })

  const categoryLabel = data.category?.trim();
  const categoryHref = data.categoryId
    ? searchUrlFromOptions({ category: data.categoryId })
    : undefined;
  const fullName = data.name ?? '';
  const displayName =
    fullName
      .split(' - ')[0]
      ?.split(' – ')[0]
      ?.split(' — ')[0]
      ?.trim() || fullName;
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

  const handleScroll = () => {
    if (!imgContainerRef.current) return;
    imgContainerRef.current.style.maxHeight = `calc(100vw / 0.67 - ${
      window.scrollY > 140 ? (window.scrollY - 140) / 1.5 : 0
    }px + 16px)`;
  };

  useEffect(() => {
    setMounted(true);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDesktop = mounted && smUp;

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
          <ChevronRight size={14} />
          {categoryLabel ? (
            <Link href={categoryHref} prefetch={false}>
              <Typography component="span" sx={{ fontWeight: 600 }}>{categoryLabel}</Typography>
            </Link>
          ) : null}
        </Stack>
        <Grid container columnSpacing={{ sm: 5 }} sx={styles.productContainer}>
          <Grid
            item
            xs={12}
            sm={6}
            sx={styles.imageGridItem}
            ref={isDesktop ? null : imgContainerRef}
          >
            {isDesktop ? (
              <Card sx={styles.imageCard}>
                <Grid container columnSpacing={2} sx={styles.imageSplitGrid}>
                  <Grid item xs={2} sx={styles.thumbnailColumn}>
                    {data.images && data.images.length > 1 && (
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
                    )}
                  </Grid>
                  <Grid item xs={10}>
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
                    brand: data.brandId?.toString() === '2' ? 'zara' : data.brandId,
                  })}
                  prefetch={false}
                >
                  <Typography component="span" sx={styles.brand}>
                    {data.brand}
                    <SquareArrowOutUpRight size={16} strokeWidth={3} style={{ marginTop: '2px' }} />
                  </Typography>
                </Link>
                <Typography variant="h3" sx={styles.productName} title={fullName}>
                  {displayName}
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
              <Button
                variant="contained"
                loading={!isCartReady}
                disabled={
                  showCheck ||
                  getItemQuantity(data) > 4 ||
                  variants?.every((v) => v.options.every((o) => !o.selected))
                }
                onClick={handleAddToCart}
                sx={{ mb: 2 }}
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
                    { in: !showCheck, component: 'Sepete Ekle' },
                  ]}
                />
              </Button>
              {data.description && (
                <Markdown
                  text={data.description}
                  sx={styles.description}
                  options={styles.markdownOptions}
                />
              )}
              <ProductFeatures />
              <Divider sx={{ mt: 1 }} />
              {data.attributes && <ProductAttributes attributes={data.attributes} />}
            </Stack>
          </Grid>
        </Grid>
      </Stack>

    
      <ProductFaq />
      {!!data.reviews?.length && data.rating && (
        <ProductReviews reviews={data.reviews} rating={data.rating} />
      )}
      {data.brandId && <ProductRecommendations brandId={data.brandId} productId={data.id} />}
    </Stack>
  );
};

export default ProductPageView;
