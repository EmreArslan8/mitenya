'use client';

import useScreen from '@/lib/hooks/useScreen';
import { Box, Stack, Typography } from '@mui/material';
import { useRef } from 'react';
import Slider from 'react-slick';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';
import Link from '@/components/common/Link';
import CMSImage from '../../shared/CMSImage';
import { BlockComponentBaseProps } from '..';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Button from '@/components/common/Button';
import { splitTitle } from '@/lib/utils/splitTitle';

export interface ShopFeatureBannerProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  mainBanners: {
    image: SharedImageType;
    mobileImage?: SharedImageType;
    url: string;
    title: string;
    description?: string;
    button: any;
  }[];
  sideBanners: {
    image: SharedImageType;
    url: string;
    title: string;
    description?: string;
    button: any;
  }[];
}

const ShopFeatureBanner = ({
  section,
  mainBanners = [],
  sideBanners = [],
}: ShopFeatureBannerProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();
  const sliderRef = useRef<Slider>(null);

  if (!mainBanners.length) return null;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
  };

  const descriptionVisibilitySx = {
    display: { xs: 'none', sm: 'none', md: 'block' },
  };

  return (
    <SectionBase {...section}>
      {isMobile && (
        <Box sx={styles.mobileSliderContainer}>
          <Slider {...sliderSettings} ref={sliderRef}>
            {mainBanners.map((banner, index) => {
              const image = banner.mobileImage?.data ? banner.mobileImage : banner.image;

              return (
                <Box key={index} sx={styles.mobileSlide}>
                  <Link href={banner.url} style={{ display: 'block', height: '100%' }}>
                    <Box sx={styles.mediaWrapper}>
                      <CMSImage
                        src={image.data.attributes.url}
                        alt={image.data.attributes.alternativeText}
                        fill
                      />

                      <Box sx={styles.overlay}>
                        <Stack sx={styles.overlayInner} spacing={{ xs: 1, sm: 1.5, md: 2.5 }}>
                          {banner.title && (
                            <Typography sx={styles.title} component="h2">
                              {banner.title}
                            </Typography>
                          )}

                          {banner.description && (
                            <Typography sx={{ ...styles.description, ...descriptionVisibilitySx }}>
                              {banner.description}
                            </Typography>
                          )}

                          {banner.button?.label && (
                            <Box sx={styles.ctaRow}>
                              <Button
                                sx={styles.ctaButton}
                                variant="contained"
                                size={isMobile ? 'small' : 'medium'}
                              >
                                {banner.button.label}
                              </Button>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  </Link>
                </Box>
              );
            })}
          </Slider>
        </Box>
      )}

      {!isMobile && (
        <Stack direction="row" sx={styles.container}>
          <Box sx={styles.mainSliderWrapper}>
            <Slider {...sliderSettings}>
              {mainBanners.map((banner, index) => (
                <Box key={index} sx={styles.mainSlide}>
                  <Link href={banner.url} style={{ display: 'block', height: '100%' }}>
                    <Box sx={styles.mediaWrapper}>
                      <CMSImage
                        src={banner.image.data.attributes.url}
                        alt={banner.image.data.attributes.alternativeText}
                        fill
                      />

                      <Box sx={styles.overlay}>
                        <Stack sx={styles.overlayInner} spacing={{ xs: 1, sm: 1.5, md: 2.5 }}>
                          {banner.title && (
                            <Typography sx={styles.title} component="h1">
                              {splitTitle(banner.title, 2)}
                            </Typography>
                          )}

                          {banner.description && (
                            <Typography sx={{ ...styles.description, ...descriptionVisibilitySx }}>
                              {banner.description}
                            </Typography>
                          )}

                          {banner.button?.label && (
                            <Box sx={styles.ctaRow}>
                              <Button
                                sx={styles.ctaButton}
                                variant="contained"
                                size={isMobile ? 'small' : 'medium'}
                              >
                                {banner.button.label}
                              </Button>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  </Link>
                </Box>
              ))}
            </Slider>
          </Box>

          {sideBanners.length > 0 && (
            <Stack sx={styles.sideBannersContainer}>
              {sideBanners.slice(0, 2).map((banner, index) => (
                <Box key={index} sx={styles.sideBanner}>
                  <Link href={banner.url} style={{ display: 'block', height: '100%' }}>
                    <Box sx={styles.mediaWrapper}>
                      <CMSImage
                        src={banner.image.data.attributes.url}
                        alt={banner.image.data.attributes.alternativeText}
                        fill
                      />

                      <Box sx={styles.sideOverlay}>
                        <Box sx={styles.sideOverlayInner}>
                          {banner.title && (
                            <Typography sx={styles.sideTitle} component="h3">
                              {banner.title}
                            </Typography>
                          )}

                          {banner.description && (
                            <Typography
                              sx={{
                                ...styles.sideDescription,
                                ...descriptionVisibilitySx,
                              }}
                            >
                              {banner.description}
                            </Typography>
                          )}

                          {banner.button?.label && (
                            <Box sx={styles.sideCtaRow}>
                              <Button sx={styles.sideCtaButton} variant="text">
                                {banner.button.label}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Link>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </SectionBase>
  );
};

export default ShopFeatureBanner;
