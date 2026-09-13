'use client';

import NextImage from 'next/image';
import { Heart } from '@/components/icons';
import { Share } from 'lucide-react';
import ProgressIndicator from '../ProgressIndicator';
import { MobileGalleryBehaviorProps } from './types';
import { Spinner } from '@/components/ui/Spinner';

const MobileGalleryBehavior = ({
  baseAlt,
  mobileGallery,
  scrollerRef,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: MobileGalleryBehaviorProps) => {
  return (
    <div className="flex flex-col sm:hidden">
      <div className="relative w-full">
        <div className="absolute top-3 right-3 z-[2] flex flex-col gap-1">
          <button type="button" className="inline-flex size-11 appearance-none items-center justify-center border-0 bg-transparent text-[#111] drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
            aria-label={isFavorited ? 'Favorilerden cikar' : 'Favorilere ekle'}
            onClick={onFavoriteClick}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <Spinner size={16} className="text-primary" />
            ) : (
              <Heart size={24} fill={isFavorited ? 'currentColor' : 'none'} />
            )}
          </button>
          <button type="button" className="inline-flex size-11 appearance-none items-center justify-center border-0 bg-transparent text-[#111] drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
            aria-label="Paylas"
            onClick={onShareClick}
          >
            <Share size={24} />
          </button>
        </div>

        <div className="relative flex w-full snap-x snap-mandatory flex-row overflow-x-scroll border-y border-bg-light [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" ref={scrollerRef}>
          {mobileGallery.map((image, index) => (
            <div className="relative aspect-square w-full shrink-0 snap-center bg-white" key={image.originalSrc ?? image.src}>
              {/*
                Loader'a HAM kaynak veriliyor; srcset adaylarini next/image
                uretiyor. Onceki elle kurulan profil yalnizca [720, 1280]
                iceriyordu ve 390px'lik telefonda 748px gerekirken 1280w
                iniyordu (LCP gorseli!).
              */}
              <NextImage
                src={image.originalSrc ?? image.src}
                alt={index === 0 ? baseAlt : `${baseAlt} - gorsel ${index + 1}`}
                fill
                sizes={image.sizes ?? '100vw'}
                quality={82}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="size-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <ProgressIndicator scrollerRef={scrollerRef} total={mobileGallery.length} />
      </div>
    </div>
  );
};

export default MobileGalleryBehavior;
