'use client';

import useScreen from '@/lib/hooks/useScreen';
import { Box, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopBannerItem from '../../shared/ShopBannerItem';
import { SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ShopBannersProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  banners: { image: SharedImageType; mobileImage: SharedImageType; url: string }[];
}

const ShopBanner = ({ section, banners }: ShopBannersProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 10000, stopOnMouseEnter: true, stopOnInteraction: false })],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  if (!banners?.length) return null;

  if (banners.length === 1) {
    return (
      <SectionBase {...section}>
        <ShopBannerItem
          url={banners[0]?.url}
          image={
            isMobile && banners[0]?.mobileImage?.data ? banners[0].mobileImage : banners[0]?.image
          }
          sx={{ borderRadius: { xs: 1, sm: 2 }, overflow: 'clip' }}
        />
      </SectionBase>
    );
  }

  return (
    <SectionBase {...section}>
      <Stack sx={styles.sliderContainer}>
        {/* Viewport */}
        <Box ref={emblaRef as React.Ref<HTMLDivElement>} sx={{ overflow: 'hidden' }}>
          <Box sx={{ display: 'flex' }}>
            {banners.map((banner) => (
              <Box
                key={banner.url}
                sx={{
                  // mobile: 100% - 32px (16px padding each side) = centerMode effect
                  flex: { xs: '0 0 calc(100% - 32px)', sm: '0 0 100%' },
                  minWidth: 0,
                  px: { xs: 0.5, sm: 0 },
                }}
              >
                <ShopBannerItem
                  url={banner.url}
                  image={isMobile && banner.mobileImage?.data ? banner.mobileImage : banner.image}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Dots */}
        <Stack sx={styles.dotsContainer}>
          {banners.map((_, i) => (
            <Box
              key={i}
              component="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Banner ${i + 1}`}
              sx={styles.dot(i === selectedIndex)}
            />
          ))}
        </Stack>

        {/* Prev / Next */}
        <Button
          color="neutral"
          size="small"
          variant="tonal"
          onClick={() => emblaApi?.scrollPrev()}
          sx={styles.prevButton}
        >
          <ChevronLeft color="white" size={26} style={{ marginRight: '2px' }} />
        </Button>
        <Button
          color="neutral"
          size="small"
          variant="tonal"
          onClick={() => emblaApi?.scrollNext()}
          sx={styles.nextButton}
        >
          <ChevronRight color="white" size={26} style={{ marginLeft: '2px' }} />
        </Button>
      </Stack>
    </SectionBase>
  );
};

export default ShopBanner;
