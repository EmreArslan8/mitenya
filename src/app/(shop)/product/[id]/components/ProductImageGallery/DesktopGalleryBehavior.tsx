'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import { R2_IMAGE_PROFILES, r2ImageUrl, r2Url } from '@/lib/utils/r2';
import NextImage from 'next/image';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, Heart } from '@/components/icons';
import { Share } from 'lucide-react';
import ProductImageMagnifier from '../ProductImageMagnifier';
import useStyles from './styles';
import { DesktopGalleryBehaviorProps } from './types';

const DesktopGalleryBehavior = ({
  imageList,
  name,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: DesktopGalleryBehaviorProps) => {
  const styles = useStyles();
  const primaryProfile = R2_IMAGE_PROFILES.productPdpPrimary;
  const thumbnailProfile = R2_IMAGE_PROFILES.productPdpThumbnail;
  const [currentImg, setCurrentImg] = useState(imageList[0]);

  useEffect(() => {
    setCurrentImg(imageList[0]);
  }, [imageList]);

  const activeImage = imageList.includes(currentImg ?? '') ? currentImg : imageList[0];

  // Ana gorsel: ham kaynak, srcset'i next/image loader'i kuruyor.
  const activeRawSrc = r2Url(activeImage);
  // Buyutec katmani: %250 olceklendigi icin sabit yuksek cozunurluk gerekli.
  // Bu URL, masaustunde ana gorselin sectigi adayla BIREBIR ayni string
  // (`width=1280,format=auto,quality=82`), dolayisiyla ikinci indirme olmuyor.
  const activeZoomSrc = r2ImageUrl(activeImage, {
    width: 1280,
    quality: primaryProfile.quality,
    format: primaryProfile.format,
  });
  const currentImageIndex = Math.max(0, imageList.findIndex((src) => src === activeImage));

  const handlePrevImage = () => {
    if (imageList.length < 2) return;
    const nextIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
    setCurrentImg(imageList[nextIndex]);
  };

  const handleNextImage = () => {
    if (imageList.length < 2) return;
    const nextIndex = (currentImageIndex + 1) % imageList.length;
    setCurrentImg(imageList[nextIndex]);
  };

  return (
    <Card sx={styles.imageCard}>
      <Stack sx={styles.imageSplitGrid}>
        {imageList.length > 1 ? (
          <Stack sx={styles.thumbnailColumn}>
            {imageList.map((src, index) => (
              <Box
                key={src}
                component="button"
                type="button"
                onClick={() => setCurrentImg(src)}
                sx={{
                  ...styles.thumbnail,
                  ...(src === activeImage ? styles.thumbnailSelected : {}),
                }}
                aria-label={`Urun gorseli ${index + 1}`}
              >
                {/*
                  Thumbnail sabit 96px: `sizes` YERINE width/height veriliyor.
                  Boylece next/image kind="x"e dusup tam 2 aday uretiyor
                  (96w 1x, 192w 2x). `sizes="96px"` yazilsaydi icinde vw
                  olmadigi icin TUM aday listesi basilirdi.
                */}
                <NextImage
                  src={r2Url(src)}
                  alt=""
                  width={96}
                  height={96}
                  quality={thumbnailProfile.quality}
                  loading="lazy"
                  style={styles.thumbnailImage}
                />
              </Box>
            ))}
          </Stack>
        ) : null}

        <Stack sx={styles.magnifierWrapper}>
          <Stack sx={styles.galleryTopBar}>
            <Stack sx={styles.galleryCounter}>
              <Typography component="span" sx={styles.galleryCounterText}>
                {currentImageIndex + 1}/{imageList.length}
              </Typography>
            </Stack>

            <Stack sx={styles.gallerySideActions}>
              <IconButton
                size="small"
                sx={styles.galleryActionButton}
                aria-label="Paylas"
                onClick={onShareClick}
              >
                <Share size={18} />
              </IconButton>
              <IconButton
                size="small"
                sx={styles.galleryActionButton}
                aria-label={isFavorited ? 'Favorilerden cikar' : 'Favorilere ekle'}
                onClick={onFavoriteClick}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                )}
              </IconButton>
            </Stack>
          </Stack>

          <Box sx={styles.imageContainer}>
            <ProductImageMagnifier
              src={activeRawSrc}
              zoomSrc={activeZoomSrc}
              sizes={primaryProfile.sizes}
              quality={primaryProfile.quality}
              alt={name}
              zoomLevel={2.5}
              loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
              fetchPriority={currentImageIndex === 0 ? 'high' : 'auto'}
            />
          </Box>

          <Stack sx={styles.galleryBottomBar}>
            <Stack direction="row" gap={1}>
              <IconButton
                size="small"
                sx={styles.galleryNavButton}
                onClick={handlePrevImage}
                aria-label="Onceki gorsel"
              >
                <ChevronLeft size={18} />
              </IconButton>
              <IconButton
                size="small"
                sx={styles.galleryNavButton}
                onClick={handleNextImage}
                aria-label="Sonraki gorsel"
              >
                <ChevronRight size={18} />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default DesktopGalleryBehavior;
