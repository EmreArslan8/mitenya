'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from '@/components/icons';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedImageType } from '../../shared/cmsTypes';
import ShopSliderCard from '../../shared/ShopSliderCard';
import { BlockComponentBaseProps } from '..';

export interface ShopSliderCardsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  cards: { image: SharedImageType; label?: string; url: string; title?: string }[];
}

const ShopSliderCards = ({ section, cards }: ShopSliderCardsProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, slidesToScroll: 1, align: 'start' });
  if (!cards?.length) return null;

  return (
    <SectionBase {...section}>
      <div className="flex flex-col gap-4">
        <h2 className="px-4 text-xl font-semibold sm:px-0">Popüler Kategoriler</h2>
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {cards.map((card) => (
                <div key={card.url} className="min-w-0 shrink-0 basis-[83.333%] pr-2 sm:basis-[45.455%] sm:pr-4 md:basis-[31.25%] lg:basis-[22.222%]">
                  <ShopSliderCard {...card} />
                </div>
              ))}
            </div>
          </div>
          <button type="button" aria-label="Önceki" onClick={() => emblaApi?.scrollPrev()} className="absolute -left-3 top-1/2 z-1 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-accentRed text-white shadow-[0_5px_12px_rgba(17,17,17,0.08)] hover:bg-accentRed-dark sm:flex"><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Sonraki" onClick={() => emblaApi?.scrollNext()} className="absolute -right-3 top-1/2 z-1 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-accentRed text-white shadow-[0_5px_12px_rgba(17,17,17,0.08)] hover:bg-accentRed-dark sm:flex"><ChevronRight size={18} /></button>
        </div>
      </div>
    </SectionBase>
  );
};

export default ShopSliderCards;
