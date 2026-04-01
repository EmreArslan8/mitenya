'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, Heart, Share } from 'lucide-react';
import ProductImageMagnifier from '../ProductImageMagnifier';
import useStyles from './styles';
import { DesktopProductImageGalleryProps } from './types';

const DesktopProductImageGallery = ({
  imageList,
  name,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: DesktopProductImageGalleryProps) => {
  const styles = useStyles();
  const [currentImg, setCurrentImg] = useState(imageList[0]);

  useEffect(() => {
    setCurrentImg(imageList[0]);
  }, [imageList]);

  const activeImage = imageList.includes(currentImg ?? '') ? currentImg : imageList[0];
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
            <ProductImageMagnifier src={activeImage} alt={name} zoomLevel={2.5} />
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

export default DesktopProductImageGallery;
