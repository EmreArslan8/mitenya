'use client'; // Add this at the very top of the file

import { useEffect, useState, useRef, useContext } from 'react';
import Icon from '@/components/Icon';
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
import { Divider, Grid, Rating, Stack, Tab, Tabs, Typography } from '@mui/material';
import ProductAttributes from './components/ProductAttributes';
import ProductFaq from './components/ProductFaq';
import ProductFeatures from './components/ProductFeatures';
import ProductRecommendations from './components/ProductRecommendations';
import ProductReviews from './components/ProductReviews';
import ProductSizeGuide from './components/ProductSizeGuide';
import ProductVariants from './components/ProductVariants';
import ProgressIndicator from './components/ProgressIndicator';
import useStyles from './styles';
import { useRouter } from 'next/navigation';
import formatPrice from '@/lib/utils/formatPrice';

const ProductPageView = ({ data }: { data: ShopProductData }) => {
  const { isCartReady, handleAddItem, getItemQuantity } = useContext(ShopContext);
  const styles = useStyles();
  const router = useRouter();
  const { smUp } = useScreen();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const [currentImg, setCurrentImg] = useState(data.imgSrc);
  const [variants, setVariants] = useState(data.variants);
  const [showCheck, setShowCheck] = useState(false);

  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;

  console.log("data:", data.price)

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
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 1000);
    handleAddItem({ ...data, variants: variants });
  };

  const handleScroll = () => {
    if (!imgContainerRef.current) return;
    imgContainerRef.current.style.maxHeight = `calc(100vw / 0.67 - ${
      window.scrollY > 140 ? (window.scrollY - 140) / 1.5 : 0
    }px + 16px)`;
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Grid container columnSpacing={{ sm: 5 }} sx={styles.productContainer}>
          <Grid item xs={12} sm={6} sx={styles.imageGridItem} ref={smUp ? null : imgContainerRef}>
            {smUp ? (
              <Card sx={styles.imageCard}>
                <Stack sx={styles.imageContainer}>
                  <img src={currentImg} alt={data.name} style={styles.image} />
                </Stack>
                {data.images && data.images.length > 1 && (
                  <Tabs
                    variant="scrollable"
                    scrollButtons
                    value={currentImg}
                    sx={styles.thumbnails}
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
          <Grid item xs={12} sm={6} zIndex={2}>
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
                    <Icon name="open_in_new" fontSize={13} weight={600} sx={{ mt: '2px' }} />
                  </Typography>
                </Link>
                <Typography variant="h3" sx={styles.productName}>
                  {data.name}
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
                    { in: showCheck, component: <Icon name="check" /> },
                    { in: !showCheck, component: ('Sepete Ekle') },
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
