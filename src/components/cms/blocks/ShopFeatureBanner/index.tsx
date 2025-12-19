'use client';

import useScreen from '@/lib/hooks/useScreen';
import { Box, Stack } from '@mui/material';
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

export interface ShopFeatureBannerProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  mainBanners: {
    image: SharedImageType;
    mobileImage?: SharedImageType;
    url: string;
  }[];
  sideBanners: {
    image: SharedImageType;
    url: string;
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

  return (
    <SectionBase {...section}>
      {/* 🔴 MOBILE: SADECE SLIDER */}
      {isMobile && (
        <Box sx={styles.mobileSliderContainer}>
          <Slider {...sliderSettings} ref={sliderRef}>
            {mainBanners.map((banner, index) => {
              const image = banner.mobileImage?.data
                ? banner.mobileImage
                : banner.image;

              return (
                <Box key={index} sx={styles.mobileSlide}>
                  <Link href={banner.url}>
                    <CMSImage
                      src={image.data.attributes.url}
                      alt={image.data.attributes.alternativeText}
                      fill
                    />
                  </Link>
                </Box>
              );
            })}
          </Slider>
        </Box>
      )}

      {/* 🟢 DESKTOP: SOL SLIDER + SAĞ BANNER */}
      {!isMobile && (
        <Stack direction="row" sx={styles.container}>
          {/* SOL – ANA SLIDER */}
          <Box sx={styles.mainSliderWrapper}>
            <Slider {...sliderSettings}>
              {mainBanners.map((banner, index) => (
                <Box key={index} sx={styles.mainSlide}>
                  <Link href={banner.url}>
                    <CMSImage
                      src={banner.image.data.attributes.url}
                      alt={banner.image.data.attributes.alternativeText}
                      fill
                    />
                  </Link>
                </Box>
              ))}
            </Slider>
          </Box>

          {/* SAĞ – 2 BANNER */}
          {sideBanners.length > 0 && (
            <Stack sx={styles.sideBannersContainer}>
              {sideBanners.slice(0, 2).map((banner, index) => (
                <Box key={index} sx={styles.sideBanner}>
                  <Link href={banner.url}>
                    <CMSImage
                      src={banner.image.data.attributes.url}
                      alt={banner.image.data.attributes.alternativeText}
                      fill
                    />
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
