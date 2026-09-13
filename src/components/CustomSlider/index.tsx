'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import Image from 'next/image';
import { Children, useEffect } from 'react';
import { DoubleChevronLeft, DoubleChevronRight } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

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
    <div className="relative w-full self-center overflow-visible">
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
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className={cn(
              'absolute top-1/2 z-[1] hidden min-w-0 -translate-y-1/2 items-center justify-center border-0 p-0 sm:flex',
              arrowVariant === 'editorial'
                ? 'left-[-52px] h-[88px] w-[52px] rounded-none bg-transparent text-gray-800 shadow-none hover:bg-transparent hover:text-gray-900 md:left-[-68px] md:w-[68px]'
                : 'left-[-12px] size-9 rounded-full bg-accentRed text-accentRed-contrast-text shadow-[0_5px_12px_rgba(17,17,17,0.08)] hover:bg-accentRed-dark hover:shadow-[0_6px_14px_rgba(17,17,17,0.12)]',
            )}
            aria-label="Önceki"
          >
            {arrowVariant === 'editorial' ? (
              <span className="block size-8 shrink-0 leading-none md:size-[38px]">
                <DoubleChevronLeft size="100%" />
              </span>
            ) : (
              <span className="relative block size-4 shrink-0 sm:size-[18px]">
                <Image
                  src="/static/images/icons/chevron-left.svg"
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 599px) 16px, 18px"
                />
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className={cn(
              'absolute top-1/2 z-[1] hidden min-w-0 -translate-y-1/2 items-center justify-center border-0 p-0 sm:flex',
              arrowVariant === 'editorial'
                ? 'right-[-52px] h-[88px] w-[52px] rounded-none bg-transparent text-gray-800 shadow-none hover:bg-transparent hover:text-gray-900 md:right-[-68px] md:w-[68px]'
                : 'right-[-12px] size-9 rounded-full bg-accentRed text-accentRed-contrast-text shadow-[0_5px_12px_rgba(17,17,17,0.08)] hover:bg-accentRed-dark hover:shadow-[0_6px_14px_rgba(17,17,17,0.12)]',
            )}
            aria-label="Sonraki"
          >
            {arrowVariant === 'editorial' ? (
              <span className="block size-8 shrink-0 leading-none md:size-[38px]">
                <DoubleChevronRight size="100%" />
              </span>
            ) : (
              <span className="relative block size-4 shrink-0 sm:size-[18px]">
                <Image
                  src="/static/images/icons/chevron-right.svg"
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 599px) 16px, 18px"
                />
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default CustomSlider;
