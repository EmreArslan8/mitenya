'use client';

import { Box, Button, Stack } from '@mui/material';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Image from 'next/image';
import { Children, useEffect } from 'react';
import { DoubleChevronLeft, DoubleChevronRight } from '@/components/icons';
import useStyles from './styles';

export interface SliderHandle {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

interface CustomSliderProps {
  children?: React.ReactNode;
  slidesToShow?: number;
  slidesToScroll?: number;
  infinite?: boolean;
  autoplay?: boolean;
  autoplaySpeed?: number;
  pauseOnHover?: boolean;
  showControls?: boolean;
  sliderRef?: React.MutableRefObject<SliderHandle | null>;
  afterChange?: (index: number) => void;
  arrows?: boolean;
  arrowVariant?: 'default' | 'editorial';
}

const CustomSlider = ({
  children,
  slidesToShow = 1,
  slidesToScroll = 1,
  infinite = true,
  autoplay: autoplayEnabled = false,
  autoplaySpeed = 3000,
  pauseOnHover = true,
  showControls = true,
  sliderRef: externalRef,
  afterChange,
  arrows,
  arrowVariant = 'default',
}: CustomSliderProps) => {
  const plugins = [
    ...(autoplayEnabled
      ? [Autoplay({ delay: autoplaySpeed, stopOnMouseEnter: pauseOnHover, stopOnInteraction: false })]
      : []),
    WheelGesturesPlugin(),
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: infinite, slidesToScroll, align: 'start' },
    plugins,
  );

  const styles = useStyles();

  useEffect(() => {
    if (!externalRef || !emblaApi) return;
    externalRef.current = {
      scrollPrev: () => emblaApi.scrollPrev(),
      scrollNext: () => emblaApi.scrollNext(),
      scrollTo: (index) => emblaApi.scrollTo(index),
    };
    return () => {
      externalRef.current = null;
    };
  }, [emblaApi, externalRef]);

  useEffect(() => {
    if (!emblaApi || !afterChange) return;
    const onSelect = () => afterChange(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, afterChange]);

  if (Children.count(children) === 0) return null;

  return (
    <Stack sx={styles.sliderContainer}>
      <div ref={emblaRef} style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          {Children.map(children, (child, i) => (
            <div
              key={i}
              style={{ flex: `0 0 calc(100% / ${slidesToShow})`, minWidth: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showControls && arrows !== false && (
        <>
          <Button
            color="neutral"
            size="small"
            variant="outlined"
            onClick={() => emblaApi?.scrollPrev()}
            sx={styles.prevButton(arrowVariant)}
            aria-label="Önceki"
          >
            {arrowVariant === 'editorial' ? (
              <Box component="span" sx={styles.editorialArrowIcon}>
                <DoubleChevronLeft size="100%" />
              </Box>
            ) : (
              <Box component="span" sx={styles.arrowIcon}>
                <Image
                  src="/static/images/icons/chevron-left.svg"
                  alt=""
                  fill
                  sizes="(max-width: 599px) 16px, 18px"
                />
              </Box>
            )}
          </Button>
          <Button
            color="neutral"
            size="small"
            variant="outlined"
            onClick={() => emblaApi?.scrollNext()}
            sx={styles.nextButton(arrowVariant)}
            aria-label="Sonraki"
          >
            {arrowVariant === 'editorial' ? (
              <Box component="span" sx={styles.editorialArrowIcon}>
                <DoubleChevronRight size="100%" />
              </Box>
            ) : (
              <Box component="span" sx={styles.arrowIcon}>
                <Image
                  src="/static/images/icons/chevron-right.svg"
                  alt=""
                  fill
                  sizes="(max-width: 599px) 16px, 18px"
                />
              </Box>
            )}
          </Button>
        </>
      )}
    </Stack>
  );
};

export default CustomSlider;
