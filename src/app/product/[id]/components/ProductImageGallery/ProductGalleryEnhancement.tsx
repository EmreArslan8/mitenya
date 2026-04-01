'use client';

import { useEffect, useRef } from 'react';
import { ShopResponsiveImage } from '@/lib/api/types';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DesktopGalleryBehavior from './DesktopGalleryBehavior';
import MobileGalleryBehavior from './MobileGalleryBehavior';
import { ProductImageGalleryBaseProps } from './types';

const GALLERY_VIEWPORT_COOKIE = 'gallery_viewport';

type ProductGalleryEnhancementProps = ProductImageGalleryBaseProps & {
  imageList: string[];
  mobileGallery: ShopResponsiveImage[];
  baseAlt: string;
  initialIsDesktop?: boolean;
};

const ProductGalleryEnhancement = ({
  imageList,
  mobileGallery,
  baseAlt,
  initialIsDesktop = true,
  name,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: ProductGalleryEnhancementProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'), {
    defaultMatches: initialIsDesktop,
  });
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.cookie = `${GALLERY_VIEWPORT_COOKIE}=${isDesktop ? 'desktop' : 'mobile'}; Path=/; Max-Age=2592000; SameSite=Lax`;
  }, [isDesktop]);

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
