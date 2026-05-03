import { ShopProductData, ShopResponsiveImage } from '@/lib/api/types';
import { r2ImageSrcSet, r2ImageUrl, r2Url } from '@/lib/utils/r2';
import { PRODUCT_PDP_MOBILE_IMAGE_PROFILE } from './productPdpImageProfile';

export function buildMobileProductGalleryImages(images?: string[]): ShopResponsiveImage[] {
  if (!images?.length) return [];

  const profile = PRODUCT_PDP_MOBILE_IMAGE_PROFILE;

  return images.map((image) => ({
    src: r2ImageUrl(image, {
      width: 960,
      quality: profile.quality,
      format: profile.format,
    }),
    srcSet: r2ImageSrcSet(image, profile.widths, {
      quality: profile.quality,
      format: profile.format,
    }),
    sizes: profile.sizes,
    originalSrc: r2Url(image),
  }));
}

export function mapProductToPdpViewData(product: ShopProductData): ShopProductData {
  const images =
    product.images?.length
      ? product.images
      : product.imgSrc
      ? [product.imgSrc]
      : undefined;

  return {
    ...product,
    galleryImages: buildMobileProductGalleryImages(images),
  };
}
