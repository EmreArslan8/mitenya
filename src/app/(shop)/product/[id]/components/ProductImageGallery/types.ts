import { ShopResponsiveImage } from '@/lib/api/types';
import { MutableRefObject } from 'react';

export interface ProductImageGalleryBaseProps {
  name?: string;
  isFavorited: boolean;
  favoriteLoading: boolean;
  onFavoriteClick: () => void;
  onShareClick: () => void;
}

export interface DesktopGalleryBehaviorProps extends ProductImageGalleryBaseProps {
  imageList: string[];
}

export interface MobileGalleryBehaviorProps extends ProductImageGalleryBaseProps {
  baseAlt: string;
  mobileGallery: ShopResponsiveImage[];
  scrollerRef: MutableRefObject<HTMLDivElement | null>;
}
