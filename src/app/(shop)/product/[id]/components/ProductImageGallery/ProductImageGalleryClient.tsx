'use client';

import { ShopResponsiveImage } from '@/lib/api/types';
import ProductGalleryEnhancement from './ProductGalleryEnhancement';
import { ProductImageGalleryBaseProps } from './types';

type ProductImageGalleryClientProps = ProductImageGalleryBaseProps & {
  imageList: string[];
  mobileGallery: ShopResponsiveImage[];
  baseAlt: string;
  initialIsDesktop?: boolean;
};

const ProductImageGalleryClient = ({
  imageList,
  mobileGallery,
  baseAlt,
  initialIsDesktop,
  name,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: ProductImageGalleryClientProps) => {
  return (
    <ProductGalleryEnhancement
      imageList={imageList}
      mobileGallery={mobileGallery}
      baseAlt={baseAlt}
      initialIsDesktop={initialIsDesktop}
      name={name}
      isFavorited={isFavorited}
      favoriteLoading={favoriteLoading}
      onFavoriteClick={onFavoriteClick}
      onShareClick={onShareClick}
    />
  );
};

export default ProductImageGalleryClient;
