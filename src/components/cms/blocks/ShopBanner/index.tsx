'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils/cn';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopBannerItem from '../../shared/ShopBannerItem';
import { SharedButtonType, SharedImageType } from '../../shared/cmsTypes';

export const AUTOPLAY_DELAY = 10000;

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: AUTOPLAY_DELAY, stopOnMouseEnter: true, stopOnInteraction: false })],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
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
    return <SectionBase {...section} fullBleed><ShopBannerItem {...banners[0]} index={0} className="overflow-clip" /></SectionBase>;
  }

  return (
    <SectionBase {...section} fullBleed>
      <div className="relative w-screen self-center overflow-hidden pb-6 sm:w-full">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {banners.map((banner, index) => (
              <div key={`${banner.url}-${index}`} className="min-w-0 flex-[0_0_100%]">
                <ShopBannerItem {...banner} index={index} />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-0.5 inset-x-0 z-2 flex flex-row items-center justify-center gap-2.5">
          {banners.map((_, index) => {
            const active = index === selectedIndex;
            return (
              <button key={index} type="button" onClick={() => emblaApi?.scrollTo(index)} aria-label={`${index + 1}. banner`} aria-current={active} className={cn('relative flex cursor-pointer items-center appearance-none border-0 bg-transparent py-[11px] transition-[width] duration-[450ms] before:block before:h-0.5 before:w-full before:rounded-full before:bg-gray-300 hover:before:bg-gray-500', active ? 'w-11' : 'w-[18px]')}>
                <span key={`${index}-${selectedIndex}`} style={{ animationPlayState: autoplayPaused ? 'paused' : 'running' }} className={cn('absolute inset-x-0 top-1/2 -mt-px h-0.5 origin-left rounded-full bg-text motion-reduce:animate-none', active ? 'animate-banner-progress motion-reduce:scale-x-100' : 'scale-x-0')} />
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => emblaApi?.scrollPrev()} aria-label="Önceki banner" className="absolute left-3.5 top-1/2 z-2 hidden h-[52px] w-[30px] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 opacity-75 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-opacity hover:opacity-100 focus-visible:opacity-100 sm:flex"><Image src="/static/images/icons/chevron-left.svg" alt="" width={20} height={32} className="h-8 w-5 object-fill" unoptimized /></button>
        <button type="button" onClick={() => emblaApi?.scrollNext()} aria-label="Sonraki banner" className="absolute right-3.5 top-1/2 z-2 hidden h-[52px] w-[30px] -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0 opacity-75 drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-opacity hover:opacity-100 focus-visible:opacity-100 sm:flex"><Image src="/static/images/icons/chevron-right.svg" alt="" width={20} height={32} className="h-8 w-5 object-fill" unoptimized /></button>
      </div>
    </SectionBase>
  );
};

export default ShopBanner;
