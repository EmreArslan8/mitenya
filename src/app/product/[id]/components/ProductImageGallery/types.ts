import { ShopResponsiveImage } from '@/lib/api/types';
import { MutableRefObject } from 'react';

export interface ProductImageGalleryBaseProps {
  name?: string;
  isFavorited: boolean;
  favoriteLoading: boolean;
  onFavoriteClick: () => void;
  onShareClick: () => void;
}

export interface DesktopProductImageGalleryProps extends ProductImageGalleryBaseProps {
  imageList: string[];
}

export interface MobileProductImageGalleryProps extends ProductImageGalleryBaseProps {
  baseAlt: string;
  mobileGallery: ShopResponsiveImage[];
  scrollerRef: MutableRefObject<HTMLDivElement | null>;
}
