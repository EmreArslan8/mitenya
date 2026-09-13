import Button from '@/components/ui/Button';
import Link from '@/components/common/Link';
import imageLoader, { buildImageSrcSet } from '@/lib/imageLoader';
import { getNextImageWidths } from '@/lib/imageSizesConfig';
import { cn } from '@/lib/utils/cn';
import { preload } from 'react-dom';
import { SharedButtonType, SharedImageType } from '../cmsTypes';

const MOBILE_MEDIA = '(max-width: 599.95px)';
const DESKTOP_MEDIA = '(min-width: 600px)';
const MOBILE_WIDTHS = [360, 420, 480, 640, 750, 828, 1080];
const resolveUrl = (url: string) => url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${url}`;

export interface ShopBannerItemProps {
  image: SharedImageType;
  mobileImage?: SharedImageType | null;
  url?: string | null;
  mobileUrl?: string | null;
  title?: string | null;
  description?: string | null;
  button?: SharedButtonType | null;
  index?: number;
  className?: string;
}

const ShopBannerItem = ({ url, mobileUrl: mobileHref, image, mobileImage, title, description, button, index = 0, className }: ShopBannerItemProps) => {
  const isVideo = image?.data.attributes.ext === '.mp4';
  const hasOverlay = !!(title || description || button?.label);
  if (!image) return null;
  const isLcpCandidate = index === 0;
  const Heading = index === 0 ? 'h1' : 'h2';
  const mobileUrl = mobileImage?.data ? resolveUrl(mobileImage.data.attributes.url) : null;
  const desktopUrl = resolveUrl(image.data.attributes.url);
  const desktopWidths = getNextImageWidths('100vw');
  const desktopSrcSet = buildImageSrcSet(desktopUrl, desktopWidths);
  const mobileSrcSet = mobileUrl ? buildImageSrcSet(mobileUrl, MOBILE_WIDTHS) : undefined;
  const desktopSrc = imageLoader({ src: desktopUrl, width: desktopWidths.at(-1) ?? 1920 });
  const mobileSrc = mobileUrl
    ? imageLoader({ src: mobileUrl, width: MOBILE_WIDTHS.at(-1) ?? 1080 })
    : undefined;

  if (isLcpCandidate) {
    preload(desktopSrc, {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: desktopSrcSet,
      imageSizes: '100vw',
      media: mobileUrl ? DESKTOP_MEDIA : undefined,
    });
    if (mobileUrl) {
      preload(mobileSrc!, {
        as: 'image',
        fetchPriority: 'high',
        imageSrcSet: mobileSrcSet,
        imageSizes: '100vw',
        media: MOBILE_MEDIA,
      });
    }
  }

  return (
    <div className={className}>
      <div className="relative m-auto aspect-[0.8] h-auto w-full overflow-hidden [&_img]:object-cover [&_img]:object-center sm:aspect-[1.78] md:aspect-[2.67] md:max-h-[min(70vh,640px)]">
        {isVideo ? (
            <video autoPlay controls={false} muted loop className="absolute bottom-0 -left-px w-[101%] border-0" src={resolveUrl(image.data.attributes.url)} />
          ) : (
            <picture className="absolute inset-0 block">
              {mobileUrl ? <source media={MOBILE_MEDIA} srcSet={mobileSrcSet ?? mobileUrl} sizes="100vw" /> : null}
              <img
                src={desktopSrc}
                srcSet={desktopSrcSet}
                sizes="100vw"
                alt={image.data.attributes.alternativeText || title || 'Mitenya Banner'}
                loading={isLcpCandidate ? 'eager' : 'lazy'}
                fetchPriority={isLcpCandidate ? 'high' : 'auto'}
                decoding="async"
                className="absolute inset-0 size-full object-cover object-center"
              />
            </picture>
          )}
        <Link href={url} aria-label={title || 'Banner detayını aç'}><span className={cn('absolute inset-0 z-1', mobileHref && 'hidden sm:block')} aria-hidden="true" /></Link>
        {mobileHref ? <Link href={mobileHref} aria-label={title || 'Banner detayını aç'}><span className="absolute inset-0 z-1 sm:hidden" aria-hidden="true" /></Link> : null}
        {hasOverlay ? (
          <div className="pointer-events-none absolute inset-0 z-2 flex items-center justify-start p-5 sm:p-8 lg:p-12">
            <div className="flex max-w-full flex-col gap-2 text-text sm:max-w-[380px] sm:gap-3 lg:max-w-[480px] lg:gap-4">
              {title ? <Heading className="break-words text-[22px] font-semibold leading-[1.1] sm:text-4xl lg:text-[46px]">{title}</Heading> : null}
              {description ? <p className="hidden text-[13px] opacity-90 sm:block sm:text-base lg:text-lg">{description}</p> : null}
              {button?.label ? (
                <div className="pointer-events-auto mt-1 sm:mt-2">
                  <Button
                    href={button.href}
                    target={button.target as '_blank' | '_self' | undefined}
                    variant={button.variant}
                    arrow={button.arrow === 'none' ? undefined : button.arrow}
                    dataLayerEventId={button.dataLayerEventId}
                    className={cn('self-start')}
                  >
                    {button.label}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ShopBannerItem;
