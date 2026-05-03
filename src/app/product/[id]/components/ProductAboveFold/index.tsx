import { ShopProductData } from '@/lib/api/types';
import { PRODUCT_PDP_MOBILE_IMAGE_PROFILE } from '@/lib/shop/productPdpImageProfile';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { r2ImageSrcSet, r2ImageUrl } from '@/lib/utils/r2';
import NextLink from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductGalleryIsland from './ProductGalleryIsland';
import ProductPurchaseIsland from './ProductPurchaseIsland';
import { Box, Stack, Typography } from '@mui/material';
import styles from './styles';
import QATypewriterPill from '../ProductShopAssistant/QATypewriterPill';

const ProductAboveFold = ({ data }: { data: ShopProductData }) => {
  const brandLabel = data.brand?.trim();
  const brandSearchToken = data.brandSlug ?? data.brandId;
  const brandHref = brandSearchToken
    ? searchUrlFromOptions({ brand: brandSearchToken })
    : undefined;
  const categoryLabel = data.category?.trim();
  const categorySearchToken = data.categorySlug ?? data.categoryId;
  const categoryHref = categorySearchToken
    ? searchUrlFromOptions({ category: categorySearchToken })
    : undefined;
  const fullName = data.name ?? '';
  const skinTypeBadge =
    data.attributes?.find((attribute) =>
      ['skinType', 'skin_type', 'ciltTipi', 'Cilt Tipi'].includes(attribute.name)
    )?.value?.trim() ?? '';
  const badgeText = skinTypeBadge || categoryLabel || 'Cilt Bakim Urunu';
  const shortDescription = data.shortDescription?.trim() ?? '';
  const shortDescriptionParagraphs = shortDescription
    ? shortDescription
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];
  const imagePath = data.images?.[0] ?? data.imgSrc ?? '';
  const profile = PRODUCT_PDP_MOBILE_IMAGE_PROFILE;
  const imageSrc = r2ImageUrl(imagePath, {
    width: profile.widths[1],
    quality: profile.quality,
    format: profile.format,
  });
  const imageSrcSet = r2ImageSrcSet(imagePath, profile.widths, {
    quality: profile.quality,
    format: profile.format,
  });

  return (
    <Box component="section" sx={styles.wrap}>
      <Box component="nav" sx={styles.breadcrumbs} aria-label="Breadcrumb">
        <NextLink href="/">Ana Sayfa</NextLink>
        {brandLabel ? <ChevronRight size={14} /> : null}
        {brandLabel && brandHref ? <NextLink href={brandHref} prefetch={false}>{brandLabel}</NextLink> : null}
        {categoryLabel ? <ChevronRight size={14} /> : null}
        {categoryLabel && categoryHref ? <NextLink href={categoryHref} prefetch={false}>{categoryLabel}</NextLink> : null}
      </Box>

      <Box sx={styles.grid}>
        <Box sx={styles.mediaColumn}>
          <Box sx={styles.mediaShell}>
            {imageSrc ? (
              <Box
                component="img"
                src={imageSrc}
                srcSet={imageSrcSet}
                sizes={profile.sizes}
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                sx={styles.staticImage}
              />
            ) : null}
            <Box sx={styles.galleryLayer}>
              <ProductGalleryIsland data={data} />
            </Box>
          </Box>
        </Box>

        <Box sx={styles.details}>
          <Box sx={styles.titleBlock}>
            {brandLabel && brandHref ? (
              <Box component={NextLink} href={brandHref} prefetch={false} sx={styles.brand}>{brandLabel}</Box>
            ) : null}
            <Typography component="h1" sx={styles.name}>{fullName}</Typography>
          </Box>

          {data.rating ? (
            <Box component="a" href="#product-reviews" sx={styles.metaRow}>
              <span aria-label={`${data.rating.averageRating} puan`}>
                {'★'.repeat(Math.round(data.rating.averageRating))}
              </span>
              <span>({data.rating.totalCount} Yorum)</span>
            </Box>
          ) : null}

          <Box sx={styles.summary}>
            <Box component="span" sx={styles.badge}>{badgeText}</Box>
            {shortDescriptionParagraphs.length ? (
              <Stack sx={styles.shortDescription}>
                {shortDescriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <QATypewriterPill />
              </Stack>
            ) : null}
            <Box sx={styles.divider} />
          </Box>

          <ProductPurchaseIsland data={data} />
        </Box>
      </Box>
    </Box>
  );
};

export default ProductAboveFold;
