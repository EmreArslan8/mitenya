'use client';

import { useRef } from 'react';
import { ShopResponsiveImage } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { NoSsr, Stack } from '@mui/material';
import DesktopProductImageGallery from './DesktopProductImageGallery';
import MobileProductImageGallery from './MobileProductImageGallery';
import useStyles from './styles';
import { ProductImageGalleryBaseProps } from './types';

interface ProductImageGalleryProps extends ProductImageGalleryBaseProps {
  images?: string[];
  galleryImages?: ShopResponsiveImage[];
  fallbackSrc?: string;
}

const ProductImageGallery = ({
  images,
  galleryImages,
  fallbackSrc,
  name,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: ProductImageGalleryProps) => {
  const styles = useStyles();
  const { smUp } = useScreen();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const imageList = images?.length ? images : fallbackSrc ? [fallbackSrc] : [];
  const mobileGallery: ShopResponsiveImage[] =
    galleryImages?.length
      ? galleryImages
      : imageList.map((src) => ({
          src,
          originalSrc: src,
        }));
  const baseAlt = name?.trim() || 'Urun';

  if (!imageList.length) return null;

  return (
    <NoSsr fallback={<Stack sx={styles.galleryPlaceholder} aria-hidden="true" />}>
      {smUp ? (
        <DesktopProductImageGallery
          imageList={imageList}
          name={name}
          isFavorited={isFavorited}
          favoriteLoading={favoriteLoading}
          onFavoriteClick={onFavoriteClick}
          onShareClick={onShareClick}
        />
      ) : (
        <MobileProductImageGallery
          baseAlt={baseAlt}
          mobileGallery={mobileGallery}
          scrollerRef={scrollerRef}
          isFavorited={isFavorited}
          favoriteLoading={favoriteLoading}
          onFavoriteClick={onFavoriteClick}
          onShareClick={onShareClick}
        />
      )}
    </NoSsr>
  );
};

export default ProductImageGallery;
