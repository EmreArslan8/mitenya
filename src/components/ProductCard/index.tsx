'use client';

import Card from '@/components/common/Card';

import { ShopProductListItemData } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import getDiscountPercent from '@/lib/shop/getDiscountPercent';
import { CircularProgress, Link, Rating, Skeleton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import useStyles from './styles';
import Image from 'next/image';

interface ShopProductCardProps {
  data: ShopProductListItemData;
}

const ProductCard = ({ data }: ShopProductCardProps) => {
  const isMobileApp = useIsMobileApp();
  const styles = useStyles();
  const [isNavigatingToDetails, setIsNavigatingToDetails] = useState(false);

  const hasDiscount = data.price.originalPrice > data.price.currentPrice;
  const discountPercent = hasDiscount ? getDiscountPercent(data.price) : 0;

  return (
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
          <Image src={data.imgSrc} alt={data.name} style={styles.image} />
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
              {(data.price.originalPrice, data.price.currency)}
            </Typography>
          )}
          <Typography variant="infoValue" sx={styles.price}>
            {(data.price.currentPrice, data.price.currency)}
          </Typography>
        </Stack>
      </Card>
    </Link>
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
