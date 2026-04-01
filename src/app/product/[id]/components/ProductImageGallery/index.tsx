'use client';

import { useEffect, useRef, useState } from 'react';
import { ShopResponsiveImage } from '@/lib/api/types';
import Card from '@/components/common/Card';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, Heart, Share  } from 'lucide-react';
import ProductImageMagnifier from '../ProductImageMagnifier';
import ProgressIndicator from '../ProgressIndicator';
import useStyles from './styles';

interface ProductImageGalleryProps {
  images?: string[];
  galleryImages?: ShopResponsiveImage[];
  fallbackSrc?: string;
  name?: string;
  isFavorited: boolean;
  favoriteLoading: boolean;
  onFavoriteClick: () => void;
  onShareClick: () => void;
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const imageList = images?.length ? images : fallbackSrc ? [fallbackSrc] : [];
  const mobileGallery: ShopResponsiveImage[] =
    galleryImages?.length
      ? galleryImages
      : imageList.map((src) => ({
          src,
          originalSrc: src,
        }));
  const [currentImg, setCurrentImg] = useState(imageList[0]);

  const activeImage = imageList.includes(currentImg ?? '') ? currentImg : imageList[0];
  const currentImageIndex = Math.max(0, imageList.findIndex((src) => src === activeImage));
  const baseAlt = name?.trim() || 'Urun';

  useEffect(() => {
    setCurrentImg(imageList[0]);
  }, [fallbackSrc, images?.join('|')]);

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

  if (!imageList.length) return null;

  return (
    <>
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
                  <img src={src} alt="" style={styles.thumbnailImage} />
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
                src={activeImage}
                alt={name}
                zoomLevel={2.5}
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

      <Stack sx={styles.mobileWrapper}>
        <Stack sx={styles.mobileImagesContainer}>
        <Stack sx={styles.mobileActions}>
          <IconButton
            size="small"
            sx={styles.mobileActionButton}
            aria-label={isFavorited ? 'Favorilerden cikar' : 'Favorilere ekle'}
            onClick={onFavoriteClick}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <CircularProgress size={16} />
            ) : (
              <Heart size={24} fill={isFavorited ? 'currentColor' : 'none'} />
            )}
          </IconButton>
          <IconButton
            size="small"
            sx={styles.mobileActionButton}
            aria-label="Paylas"
            onClick={onShareClick}
          >
            <Share size={24} />
          </IconButton>
        </Stack>
        <Stack sx={styles.mobileImages} ref={scrollerRef}>
          {mobileGallery.map((image, index) => (
            <Stack sx={styles.mobileImage} key={image.originalSrc ?? image.src}>
              <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={image.sizes ?? '100vw'}
                alt={index === 0 ? baseAlt : `${baseAlt} - gorsel ${index + 1}`}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                style={styles.image}
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
        <Stack sx={styles.progressIndicatorContainer}>
          <ProgressIndicator scrollerRef={scrollerRef} total={mobileGallery.length} />
        </Stack>
      </Stack>
    </>
  );
};

export default ProductImageGallery;
