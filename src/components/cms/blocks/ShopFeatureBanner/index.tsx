'use client';

import { Box, Stack, Typography } from '@mui/material';
import { ReactNode, useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';
import Link from '@/components/common/Link';
import CMSImage from '../../shared/CMSImage';
import { BlockComponentBaseProps } from '..';
import Button from '@/components/common/Button';
import { splitTitle } from '@/lib/utils/splitTitle';
import useScreen from '@/lib/hooks/useScreen';

export interface ShopFeatureBannerProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  mainBanners: FeatureBannerItem[];
  sideBanners: SideBannerItem[];
}

const CMS_IMAGE_SIZES = {
  bannerMain: '(min-width: 900px) 65vw, 100vw',
  bannerDesktopSide: '(min-width: 900px) 22vw, 100vw',
} as const;

type BannerButton = {
  label?: string;
};

type FeatureBannerItem = {
  image?: SharedImageType;
  mobileImage?: SharedImageType;
  mobileUrl?: string;
  url: string;
  title: string;
  description?: string;
  button?: BannerButton;
};

type SideBannerItem = {
  image: SharedImageType;
  url: string;
  title: string;
  description?: string;
  button?: BannerButton;
};

type FeatureBannerCardProps = {
  banner: FeatureBannerItem;
  index: number;
  children?: ReactNode;
};

const resolveCmsSrc = (src: string) =>
  src.startsWith('http://') || src.startsWith('https://')
    ? src
    : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${src}`;

const FeatureBannerCard = ({ banner, index, children }: FeatureBannerCardProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();
  const href = isMobile ? banner.mobileUrl?.trim() || banner.url : banner.url;
  const desktopImage = banner.image?.data;
  const mobileImage = banner.mobileImage?.data;
  const desktopSrc = desktopImage?.attributes.url;
  const mobileSrc = mobileImage?.attributes.url;
  const fallbackSrc = desktopSrc || (isMobile ? mobileSrc : undefined);
  const alt =
    mobileImage?.attributes.alternativeText ||
    desktopImage?.attributes.alternativeText ||
    banner.title ||
    'Mitenya Banner';

  if (!fallbackSrc) return null;

  return (
    <Link href={href} style={{ display: 'block', height: '100%' }}>
      <Box sx={styles.mediaWrapper}>
        <picture>
          {mobileSrc && <source media="(max-width: 899.95px)" srcSet={resolveCmsSrc(mobileSrc)} />}
          <img
            src={resolveCmsSrc(fallbackSrc)}
            alt={alt}
            sizes={CMS_IMAGE_SIZES.bannerMain}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
        </picture>

        <Box sx={styles.overlay}>
          <Stack sx={styles.overlayInner} spacing={{ xs: 1, sm: 1.5, md: 2.5 }}>
            {banner.title && (
              <Typography sx={styles.title} component={index === 0 ? 'h1' : 'h2'}>
                {splitTitle(banner.title, 2)}
              </Typography>
            )}
            {banner.description && children}
            {banner.button?.label && (
              <Box sx={styles.ctaRow}>
                <Button sx={styles.ctaButton} variant="contained">
                  {banner.button.label}
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </Link>
  );
};

const ShopFeatureBanner = ({
  section,
  mainBanners = [],
  sideBanners = [],
}: ShopFeatureBannerProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false })],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const validBanners = mainBanners.filter((b) =>
    isMobile ? b.mobileImage?.data || b.image?.data : b.image?.data,
  );

  if (!validBanners.length) return null;

  return (
    <SectionBase {...section}>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={styles.container}>
        {/* Main slider */}
        <Box sx={styles.mainSliderWrapper}>
          <Box ref={emblaRef as React.Ref<HTMLDivElement>} sx={{ overflow: 'hidden', height: '100%' }}>
            <Box sx={{ display: 'flex', height: '100%' }}>
              {validBanners.map((banner, index) => (
                <Box key={index} sx={styles.mainSlide}>
                  <FeatureBannerCard banner={banner} index={index}>
                    <Typography sx={{ ...styles.description, display: { xs: 'none', sm: 'block' } }}>
                      {banner.description}
                    </Typography>
                  </FeatureBannerCard>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Pill dots — absolute inside mainSliderWrapper */}
          {validBanners.length > 1 && (
            <Stack sx={styles.dotsContainer}>
              {validBanners.map((_, i) => (
                <Box
                  key={i}
                  component="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Slayt ${i + 1}`}
                  sx={styles.pillDot(i === selectedIndex)}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Side banners — desktop only */}
        {sideBanners.length > 0 && (
          <Stack sx={{ ...styles.sideBannersContainer, display: { xs: 'none', md: 'flex' } }}>
            {sideBanners.slice(0, 2).map((banner, index) => (
              <Box key={index} sx={styles.sideBanner}>
                <Link href={banner.url} style={{ display: 'block', height: '100%' }}>
                  <Box sx={styles.mediaWrapper}>
                    <CMSImage
                      src={banner.image.data.attributes.url}
                      alt={
                        banner.image.data.attributes.alternativeText ||
                        banner.title ||
                        'Mitenya Banner'
                      }
                      fill
                      loading="eager"
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
                          <Typography sx={styles.sideDescription}>
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
    </SectionBase>
  );
};

export default ShopFeatureBanner;
