'use client';

import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedImageType } from '../../shared/cmsTypes';
import Link from '@/components/common/Link';
import CMSImage from '../../shared/CMSImage';
import { BlockComponentBaseProps } from '..';
import { cn } from '@/lib/utils/cn';
import { splitTitle } from '@/lib/utils/splitTitle';
import imageLoader, { buildImageSrcSet } from '@/lib/imageLoader';

export interface ShopFeatureBannerProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  mainBanners: FeatureBannerItem[];
  sideBanners: SideBannerItem[];
}

const CMS_IMAGE_SIZES = { bannerMain: '(min-width: 900px) 65vw, 100vw', bannerDesktopSide: '(min-width: 900px) 22vw, 100vw' } as const;
const MAIN_IMAGE_WIDTHS = [384, 640, 750, 828, 1080, 1200, 1920] as const;
type BannerButton = { label?: string };
type FeatureBannerItem = { image?: SharedImageType; mobileImage?: SharedImageType; mobileUrl?: string; url: string; title: string; description?: string; button?: BannerButton };
type SideBannerItem = { image: SharedImageType; url: string; title: string; description?: string; button?: BannerButton };

const resolveCmsSrc = (src: string) => src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${src}`;

const FeatureBannerCard = ({ banner, index }: { banner: FeatureBannerItem; index: number }) => {
  const desktopImage = banner.image?.data;
  const mobileImage = banner.mobileImage?.data;
  const desktopSrc = desktopImage?.attributes.url;
  const mobileSrc = mobileImage?.attributes.url;
  const fallbackSrc = desktopSrc || mobileSrc;
  if (!fallbackSrc) return null;
  const alt = mobileImage?.attributes.alternativeText || desktopImage?.attributes.alternativeText || banner.title || 'Mitenya Banner';
  const resolvedDesktopSrc = resolveCmsSrc(fallbackSrc);
  const resolvedMobileSrc = mobileSrc ? resolveCmsSrc(mobileSrc) : undefined;
  const desktopSrcSet = buildImageSrcSet(resolvedDesktopSrc, MAIN_IMAGE_WIDTHS);
  const mobileSrcSet = resolvedMobileSrc
    ? buildImageSrcSet(resolvedMobileSrc, MAIN_IMAGE_WIDTHS)
    : undefined;

  return (
    <article className="relative h-full w-full">
      <picture>
        {resolvedMobileSrc ? <source media="(max-width: 899.95px)" srcSet={mobileSrcSet ?? resolvedMobileSrc} sizes="100vw" /> : null}
        <img
          src={imageLoader({ src: resolvedDesktopSrc, width: 1920 })}
          srcSet={desktopSrcSet}
          alt={alt}
          sizes={CMS_IMAGE_SIZES.bannerMain}
          className="absolute inset-0 h-full w-full object-cover"
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
          decoding="async"
        />
      </picture>
      <Link href={banner.url} aria-label={banner.title || 'Banner detayını aç'}><span className={cn('absolute inset-0 z-1', banner.mobileUrl && 'hidden md:block')} /></Link>
      {banner.mobileUrl ? <Link href={banner.mobileUrl} aria-label={banner.title || 'Banner detayını aç'}><span className="absolute inset-0 z-1 md:hidden" /></Link> : null}
      <div className="pointer-events-none absolute inset-0 z-2 flex items-center justify-start p-5 sm:p-8 md:p-8 lg:p-10">
        <div className="flex max-w-full flex-col gap-2 text-black sm:max-w-[360px] sm:gap-3 md:max-w-[360px] md:gap-5 lg:max-w-[460px]">
          {banner.title ? <h2 className="max-w-40 break-words text-lg font-medium leading-[1.2] sm:max-w-[360px] sm:text-[42px] sm:leading-[1.15] md:max-w-[280px] md:text-4xl md:leading-[1.1] lg:max-w-[400px] lg:text-[42px] lg:leading-[1.04]">{splitTitle(banner.title, 2)}</h2> : null}
          {banner.description ? <p className="hidden max-w-[300px] text-lg opacity-[92%] sm:block md:max-w-[280px] md:text-base lg:max-w-[360px] lg:text-lg">{banner.description}</p> : null}
          {banner.button?.label ? <span className="mt-3 inline-flex self-start rounded-full bg-black px-4 py-[6.4px] text-xs font-bold normal-case text-white sm:mt-5 sm:px-8 sm:py-6 sm:text-lg md:mt-4 md:px-5 md:py-2 md:text-[13px] lg:px-8 lg:py-4 lg:text-lg">{banner.button.label}</span> : null}
        </div>
      </div>
    </article>
  );
};

const ShopFeatureBanner = ({ section, mainBanners = [], sideBanners = [] }: ShopFeatureBannerProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false })]);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);
  const validBanners = mainBanners.filter((banner) => banner.image?.data || banner.mobileImage?.data);
  if (!validBanners.length) return null;

  return (
    <SectionBase {...section}>
      <div className="flex w-full flex-col items-stretch gap-4 md:flex-row">
        <div className="relative max-w-full flex-[1_1_100%] md:max-w-[65%] md:flex-[0_0_65%]">
          <div ref={emblaRef} className="h-full overflow-hidden">
            <div className="flex h-full">
              {validBanners.map((banner, index) => <div key={`${banner.url}-${index}`} className="relative block aspect-[4/5] min-w-0 flex-[0_0_100%] overflow-hidden rounded-xl sm:aspect-video md:rounded-2xl"><FeatureBannerCard banner={banner} index={index} /></div>)}
            </div>
          </div>
          {validBanners.length > 1 ? <div className="pointer-events-none absolute inset-x-0 bottom-2 z-3 flex flex-row items-center justify-center gap-2 md:bottom-3.5 md:gap-2.5">{validBanners.map((_, index) => <button key={index} type="button" onClick={() => emblaApi?.scrollTo(index)} aria-label={`Slayt ${index + 1}`} className={cn('pointer-events-auto h-[7px] rounded-full bg-white/45 transition-[width,background-color] duration-200 hover:bg-white/65 md:h-2', selectedIndex === index ? 'w-[22px] bg-white md:w-6' : 'w-[7px] md:w-2')} />)}</div> : null}
        </div>
        {sideBanners.length ? <div className="hidden max-w-[calc(35%-16px)] flex-[0_0_calc(35%-16px)] flex-col gap-4 md:flex">{sideBanners.slice(0, 2).map((banner, index) => (
          <article key={`${banner.url}-${index}`} className="relative flex-1 overflow-hidden rounded-2xl">
            <Link href={banner.url} style={{ display: 'block', height: '100%' }}>
              <div className="relative h-full w-full">
                <CMSImage src={banner.image.data.attributes.url} alt={banner.image.data.attributes.alternativeText || banner.title || 'Mitenya Banner'} fill loading="eager" fetchPriority="low" sizes={CMS_IMAGE_SIZES.bannerDesktopSide} className="object-cover" />
                <div className="pointer-events-none absolute inset-0 flex items-start justify-start bg-[linear-gradient(90deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.25)_45%,rgba(255,255,255,0)_70%)] p-6 text-left">
                  <div className="max-w-[280px] text-black">
                    {banner.title ? <h3 className="text-[30px] font-medium leading-[1.05] tracking-[-0.02em] lg:text-4xl">{banner.title}</h3> : null}
                    {banner.description ? <p className="mb-2.5 max-w-[260px] text-[28px] opacity-85 lg:text-[32px]">{banner.description}</p> : null}
                    {banner.button?.label ? <span className="pointer-events-auto font-medium underline">{banner.button.label}</span> : null}
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}</div> : null}
      </div>
    </SectionBase>
  );
};

export default ShopFeatureBanner;
