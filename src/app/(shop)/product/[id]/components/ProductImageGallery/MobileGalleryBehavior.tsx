'use client';

import { CircularProgress, IconButton, Stack } from '@mui/material';
import NextImage from 'next/image';
import { Heart } from '@/components/icons';
import { Share } from 'lucide-react';
import ProgressIndicator from '../ProgressIndicator';
import useStyles from './styles';
import { MobileGalleryBehaviorProps } from './types';

const MobileGalleryBehavior = ({
  baseAlt,
  mobileGallery,
  scrollerRef,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: MobileGalleryBehaviorProps) => {
  const styles = useStyles();

  return (
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
              {/*
                Loader'a HAM kaynak veriliyor; srcset adaylarini next/image
                uretiyor. Onceki elle kurulan profil yalnizca [720, 1280]
                iceriyordu ve 390px'lik telefonda 748px gerekirken 1280w
                iniyordu (LCP gorseli!).
              */}
              <NextImage
                src={image.originalSrc ?? image.src}
                alt={index === 0 ? baseAlt : `${baseAlt} - gorsel ${index + 1}`}
                fill
                sizes={image.sizes ?? '100vw'}
                quality={82}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
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
  );
};

export default MobileGalleryBehavior;
