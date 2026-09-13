'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import { R2_IMAGE_PROFILES, r2ImageUrl, r2Url } from '@/lib/utils/r2';
import NextImage from 'next/image';
import { ChevronLeft, ChevronRight, Heart } from '@/components/icons';
import { Share } from 'lucide-react';
import ProductImageMagnifier from '../ProductImageMagnifier';
import { DesktopGalleryBehaviorProps } from './types';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';

const DesktopGalleryBehavior = ({
  imageList,
  name,
  isFavorited,
  favoriteLoading,
  onFavoriteClick,
  onShareClick,
}: DesktopGalleryBehaviorProps) => {
  const primaryProfile = R2_IMAGE_PROFILES.productPdpPrimary;
  const thumbnailProfile = R2_IMAGE_PROFILES.productPdpThumbnail;
  const [currentImg, setCurrentImg] = useState(imageList[0]);

  useEffect(() => {
    setCurrentImg(imageList[0]);
  }, [imageList]);

  const activeImage = imageList.includes(currentImg ?? '') ? currentImg : imageList[0];

  // Ana gorsel: ham kaynak, srcset'i next/image loader'i kuruyor.
  const activeRawSrc = r2Url(activeImage);
  // Buyutec katmani: %250 olceklendigi icin sabit yuksek cozunurluk gerekli.
  // Bu URL, masaustunde ana gorselin sectigi adayla BIREBIR ayni string
  // (`width=1280,format=auto,quality=82`), dolayisiyla ikinci indirme olmuyor.
  const activeZoomSrc = r2ImageUrl(activeImage, {
    width: 1280,
    quality: primaryProfile.quality,
    format: primaryProfile.format,
  });
  const currentImageIndex = Math.max(0, imageList.findIndex((src) => src === activeImage));

  const handlePrevImage = () => {
    if (imageList.length < 2) return;
    const nextIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
    setCurrentImg(imageList[nextIndex]);
  };

  const handleNextImage = () => {
    if (imageList.length < 2) return;
    const nextIndex = (currentImageIndex + 1) % imageList.length;
    setCurrentImg(imageList[nextIndex]);
  };

  return (
    <Card className="relative hidden w-full self-center gap-0 bg-transparent sm:flex">
      <div className="flex w-full items-stretch gap-2.5 md:gap-3">
        {imageList.length > 1 ? (
          <div className="flex max-h-[560px] w-[82px] min-w-[82px] flex-col gap-2 overflow-y-auto pr-0.5 [scrollbar-width:thin] md:max-h-[760px] md:w-24 md:min-w-24">
            {imageList.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setCurrentImg(src)}
                className={cn('aspect-[4/5] w-full min-w-full shrink-0 cursor-pointer appearance-none overflow-hidden border border-[#D8D0CA] bg-white p-0 outline-none transition-[border-color,transform] hover:-translate-y-px hover:border-[#8A746A]', src === activeImage && 'border-[#111] shadow-[inset_0_0_0_1px_#111]')}
                aria-label={`Urun gorseli ${index + 1}`}
              >
                {/*
                  Thumbnail sabit 96px: `sizes` YERINE width/height veriliyor.
                  Boylece next/image kind="x"e dusup tam 2 aday uretiyor
                  (96w 1x, 192w 2x). `sizes="96px"` yazilsaydi icinde vw
                  olmadigi icin TUM aday listesi basilirdi.
                */}
                <NextImage
                  src={r2Url(src)}
                  alt=""
                  width={96}
                  height={96}
                  quality={thumbnailProfile.quality}
                  loading="lazy"
                  className="block size-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative h-[560px] min-w-0 flex-1 overflow-hidden border border-[#E7E1DC] bg-white md:h-[760px]">
          <div className="pointer-events-none absolute top-[18px] right-[18px] left-[18px] z-[2] flex items-center justify-between">
            <span className="pointer-events-auto rounded-full border border-[#111]/[8%] bg-white/[92%] px-2.5 py-[6px] text-xs leading-none font-bold tracking-[0.04em] text-[#111] shadow-[0_10px_24px_rgba(17,24,39,0.08)]">
                {currentImageIndex + 1}/{imageList.length}
            </span>

            <div className="pointer-events-auto flex gap-1">
              <button type="button" className="inline-flex size-9 appearance-none items-center justify-center border-0 bg-transparent text-[#111]"
                aria-label="Paylas"
                onClick={onShareClick}
              >
                <Share size={18} />
              </button>
              <button type="button" className="inline-flex size-9 appearance-none items-center justify-center border-0 bg-transparent text-[#111]"
                aria-label={isFavorited ? 'Favorilerden cikar' : 'Favorilere ekle'}
                onClick={onFavoriteClick}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? (
                  <Spinner size={16} className="text-primary" />
                ) : (
                  <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                )}
              </button>
            </div>
          </div>

          <div className="size-full overflow-hidden border-0">
            <ProductImageMagnifier
              src={activeRawSrc}
              zoomSrc={activeZoomSrc}
              sizes={primaryProfile.sizes}
              quality={primaryProfile.quality}
              alt={name}
              zoomLevel={2.5}
              loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
              fetchPriority={currentImageIndex === 0 ? 'high' : 'auto'}
            />
          </div>

          <div className="absolute right-[18px] bottom-[18px] z-[2] flex items-center gap-[11px]">
            <div className="flex gap-2">
              <button type="button" className="inline-flex size-12 items-center justify-center rounded-xl border border-[#D8D8D8] bg-[#F7F7F7] text-[#111] hover:border-[#C7C7C7] hover:bg-[#EEE]"
                onClick={handlePrevImage}
                aria-label="Onceki gorsel"
              >
                <ChevronLeft size={18} />
              </button>
              <button type="button" className="inline-flex size-12 items-center justify-center rounded-xl border border-[#D8D8D8] bg-[#F7F7F7] text-[#111] hover:border-[#C7C7C7] hover:bg-[#EEE]"
                onClick={handleNextImage}
                aria-label="Sonraki gorsel"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DesktopGalleryBehavior;
