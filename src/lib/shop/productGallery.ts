import { ShopProductData, ShopResponsiveImage } from '@/lib/api/types';
import { R2_IMAGE_PROFILES, r2ImageSrcSet, r2ImageUrl, r2Url } from '@/lib/utils/r2';

export function buildMobileProductGalleryImages(images?: string[]): ShopResponsiveImage[] {
  if (!images?.length) return [];

  const profile = R2_IMAGE_PROFILES.productPdpPrimary;

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
