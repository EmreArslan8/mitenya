'use client';

import { useEffect, useRef, useState } from 'react';
import Card from '@/components/common/Card';
import useScreen from '@/lib/hooks/useScreen';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import ProductImageMagnifier from '../ProductImageMagnifier';
import ProgressIndicator from '../ProgressIndicator';
import useStyles from './styles';

interface ProductImageGalleryProps {
  images?: string[];
  fallbackSrc?: string;
  name?: string;
  isFavorited: boolean;
  favoriteLoading: boolean;
  onFavoriteClick: () => void;
  onShareClick: () => void;
}

const ProductImageGallery = ({
  images,
  fallbackSrc,
  name,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: ProductImageGalleryProps) => {
  const styles = useStyles();
  const { smUp } = useScreen();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const imageList = images?.length ? images : fallbackSrc ? [fallbackSrc] : [];
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

  if (smUp) {
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
                  <Share2 size={18} />
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
    );
  }

  return (
    <>
      <Stack sx={styles.mobileImagesContainer}>
        <Stack sx={styles.mobileImages} ref={scrollerRef}>
          {imageList.map((src, index) => (
            <Stack sx={styles.mobileImage} key={src}>
              <img
                src={src}
                alt={index === 0 ? baseAlt : `${baseAlt} - gorsel ${index + 1}`}
                style={styles.image}
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
      {!!imageList.length && (
        <Stack sx={styles.progressIndicatorContainer}>
          <ProgressIndicator scrollerRef={scrollerRef} total={imageList.length} />
        </Stack>
      )}
    </>
  );
};

export default ProductImageGallery;
