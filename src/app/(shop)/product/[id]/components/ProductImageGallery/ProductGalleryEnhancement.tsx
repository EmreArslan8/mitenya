'use client';

import { useRef } from 'react';
import { ShopResponsiveImage } from '@/lib/api/types';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DesktopGalleryBehavior from './DesktopGalleryBehavior';
import MobileGalleryBehavior from './MobileGalleryBehavior';
import { ProductImageGalleryBaseProps } from './types';

type ProductGalleryEnhancementProps = ProductImageGalleryBaseProps & {
  imageList: string[];
  mobileGallery: ShopResponsiveImage[];
  baseAlt: string;
};

const ProductGalleryEnhancement = ({
  imageList,
  mobileGallery,
  baseAlt,
  name,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: ProductGalleryEnhancementProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'), {
    defaultMatches: false,
  });
  const scrollerRef = useRef<HTMLDivElement>(null);

  return isDesktop ? (
    <DesktopGalleryBehavior
      imageList={imageList}
      name={name}
      isFavorited={isFavorited}
      favoriteLoading={favoriteLoading}
      onFavoriteClick={onFavoriteClick}
      onShareClick={onShareClick}
    />
  ) : (
    <MobileGalleryBehavior
      baseAlt={baseAlt}
      mobileGallery={mobileGallery}
      scrollerRef={scrollerRef}
      isFavorited={isFavorited}
      favoriteLoading={favoriteLoading}
      onFavoriteClick={onFavoriteClick}
      onShareClick={onShareClick}
    />
  );
};

export default ProductGalleryEnhancement;
