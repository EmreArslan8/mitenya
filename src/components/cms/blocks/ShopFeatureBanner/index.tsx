'use client';

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
import Button from '@/components/common/Button';
import { splitTitle } from '@/lib/utils/splitTitle';
import useScreen from '@/lib/hooks/useScreen';

export interface ShopFeatureBannerProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  mainBanners: {
    image?: SharedImageType;
    mobileImage?: SharedImageType;
    mobileUrl?: string;
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

const CMS_IMAGE_SIZES = {
  bannerMobile: '100vw',
  bannerDesktopMain: '(min-width: 900px) 65vw, 100vw',
  bannerDesktopSide: '(min-width: 900px) 22vw, 100vw',
} as const;

const ShopFeatureBanner = ({
  section,
  mainBanners = [],
  sideBanners = [],
}: ShopFeatureBannerProps) => {
  const styles = useStyles();
  const sliderRef = useRef<Slider>(null);
  const { mdUp } = useScreen();

  const mobileBanners = mainBanners;
  const desktopBanners = mainBanners.filter((b) => b.image?.data);

  if (!mobileBanners.length) return null;

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
    display: { xs: 'none', sm: 'block', md: 'block' },
  };

  return (
    <SectionBase {...section}>
      {mdUp ? (
        <Stack direction="row" sx={styles.container}>
          <Box sx={styles.mainSliderWrapper}>
            <Slider {...sliderSettings}>
              {desktopBanners.map((banner, index) => (
                <Box key={index} sx={styles.mainSlide}>
                  <Link href={banner.url} style={{ display: 'block', height: '100%' }}>
                    <Box sx={styles.mediaWrapper}>
                      <CMSImage
                        src={banner.image!.data.attributes.url}
                        alt={banner.image!.data.attributes.alternativeText || banner.title || 'Mitenya Banner'}
                        fill
                        priority={index === 0}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        sizes={CMS_IMAGE_SIZES.bannerDesktopMain}
                      />

                      <Box sx={styles.overlay}>
                        <Stack sx={styles.overlayInner} spacing={{ xs: 1, sm: 1.5, md: 2.5 }}>
                          {banner.title && (
                            <Typography sx={styles.title} component={index === 0 ? 'h1' : 'h2'}>
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
                              <Button sx={styles.ctaButton} variant="contained" size="medium">
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
                        alt={banner.image.data.attributes.alternativeText || banner.title || 'Mitenya Banner'}
                        fill
                        loading="lazy"
                        fetchPriority="low"
                        sizes={CMS_IMAGE_SIZES.bannerDesktopSide}
                      />

                      <Box sx={styles.sideOverlay}>
                        <Box sx={styles.sideOverlayInner}>
                          {banner.title && (
                            <Typography sx={styles.sideTitle} component="h3">
                              {banner.title}
                            </Typography>
                          )}

                          {banner.description && (
                            <Typography sx={{ ...styles.sideDescription, ...descriptionVisibilitySx }}>
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
      ) : (
        <Box sx={styles.mobileSliderContainer}>
          <Slider {...sliderSettings} ref={sliderRef}>
            {mobileBanners.map((banner, index) => {
              const image = banner.mobileImage?.data ? banner.mobileImage : banner.image;
              if (!image?.data) return null;
              const mobileHref = banner.mobileUrl?.trim();

              return (
                <Box key={index} sx={styles.mobileSlide}>
                  <Link href={mobileHref} style={{ display: 'block', height: '100%' }}>
                    <Box sx={styles.mediaWrapper}>
                      <CMSImage
                        src={image.data.attributes.url}
                        alt={image.data.attributes.alternativeText || banner.title || 'Mitenya Banner'}
                        fill
                        priority={index === 0}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        sizes={CMS_IMAGE_SIZES.bannerMobile}
                      />

                      <Box sx={styles.overlay}>
                        <Stack sx={styles.overlayInner} spacing={{ xs: 1, sm: 1.5, md: 2.5 }}>
                          {banner.title && (
                            <Typography sx={styles.title} component={index === 0 ? 'h1' : 'h2'}>
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
                              <Button sx={styles.ctaButton} variant="contained" size="small">
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
    </SectionBase>
  );
};

export default ShopFeatureBanner;
