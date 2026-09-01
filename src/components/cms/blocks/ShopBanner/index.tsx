'use client';

import useScreen from '@/lib/hooks/useScreen';
import { Box, Stack } from '@mui/material';
import Image from 'next/image';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopBannerItem from '../../shared/ShopBannerItem';
import { SharedButtonType, SharedImageType } from '../../shared/cmsTypes';
import useStyles, { AUTOPLAY_DELAY } from './styles';


export interface ShopBannersProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  banners: {
    image: SharedImageType;
    mobileImage: SharedImageType;
    url: string;
    mobileUrl?: string | null;
    title?: string | null;
    description?: string | null;
    button?: SharedButtonType | null;
  }[];
}

const ShopBanner = ({ section, banners }: ShopBannersProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Kullanici cubuga dokununca otomatik gecis duruyor (WCAG 2.2.2).
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    // stopOnInteraction: false sart — true olursa hover'a girildiginde
    // autoplay kalici duruyor ve slayt bir daha hic ilerlemiyor.
    [Autoplay({ delay: AUTOPLAY_DELAY, stopOnMouseEnter: true, stopOnInteraction: false })],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    // Cubugun dolumu otomatik gecisin gercek durumuna bagli: hover'da
    // autoplay durunca animasyon da duruyor, yoksa cubuk dolup slayt
    // beklemeye devam ediyordu.
    const onAutoplayStop = () => setAutoplayPaused(true);
    const onAutoplayPlay = () => setAutoplayPaused(false);

    emblaApi.on('select', onSelect);
    emblaApi.on('autoplay:stop', onAutoplayStop);
    emblaApi.on('autoplay:play', onAutoplayPlay);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('autoplay:stop', onAutoplayStop);
      emblaApi.off('autoplay:play', onAutoplayPlay);
    };
  }, [emblaApi]);

  if (!banners?.length) return null;

  if (banners.length === 1) {
    return (
      <SectionBase {...section} sx={{ p: 0 }}>
        <ShopBannerItem
          url={(isMobile && banners[0]?.mobileUrl?.trim()) || banners[0]?.url}
          image={
            isMobile && banners[0]?.mobileImage?.data ? banners[0].mobileImage : banners[0]?.image
          }
          title={banners[0]?.title}
          description={banners[0]?.description}
          button={banners[0]?.button}
          index={0}
          sx={{ overflow: 'clip' }}
        />
      </SectionBase>
    );
  }

  return (
    <SectionBase {...section} sx={{ p: 0 }}>
      <Stack sx={styles.sliderContainer}>
        {/* Viewport */}
        <Box ref={emblaRef as React.Ref<HTMLDivElement>} sx={{ overflow: 'hidden' }}>
          <Box sx={{ display: 'flex' }}>
            {banners.map((banner, index) => (
              <Box
                key={banner.url}
                sx={{
                  flex: '0 0 100%',
                  minWidth: 0,
                }}
              >
                <ShopBannerItem
                  url={(isMobile && banner.mobileUrl?.trim()) || banner.url}
                  image={isMobile && banner.mobileImage?.data ? banner.mobileImage : banner.image}
                  title={banner.title}
                  description={banner.description}
                  button={banner.button}
                  index={index}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Segment cubuklari: konum + kalan sure */}
        <Stack sx={styles.progressContainer}>
          {banners.map((_, i) => (
            <Box
              key={i}
              component="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`${i + 1}. banner`}
              aria-current={i === selectedIndex}
              sx={styles.progressTrack(i === selectedIndex)}
            >
              <Box
                key={`${i}-${selectedIndex}`}
                sx={styles.progressFill(i === selectedIndex, autoplayPaused)}
              />
            </Box>
          ))}
        </Stack>

        {/* Oklar: yalnizca masaustunde, hover'da */}
        <Button
          color="neutral"
          size="small"
          variant="tonal"
          className="banner-arrow"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Önceki banner"
          sx={{ ...styles.arrowBase, ...styles.prevButton }}
        >
          <Image
            src="/static/images/icons/chevron-left.svg"
            alt=""
            width={20}
            height={32}
            style={{ objectFit: 'fill' }}
          />
        </Button>
        <Button
          color="neutral"
          size="small"
          variant="tonal"
          className="banner-arrow"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Sonraki banner"
          sx={{ ...styles.arrowBase, ...styles.nextButton }}
        >
          <Image
            src="/static/images/icons/chevron-right.svg"
            alt=""
            width={20}
            height={32}
            style={{ objectFit: 'fill' }}
          />
        </Button>
      </Stack>
    </SectionBase>
  );
};

export default ShopBanner;
