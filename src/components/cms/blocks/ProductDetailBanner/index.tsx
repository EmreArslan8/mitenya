import Button from '@/components/ui/Button';
import Link from '@/components/common/Link';
import CMSImage from '@/components/cms/shared/CMSImage';
import { SharedButtonType, SharedImageType } from '@/components/cms/shared/cmsTypes';
import SectionBase, { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { buildCloudinaryUrl } from '@/lib/imageLoader';
import type { BlockComponentBaseProps } from '..';

const MARQUEE_ITEMS = ['PÜRÜZSÜZLÜK.', 'YOĞUN NEM.', 'IŞILTI.', 'SIKILAŞMA.', 'CANLILIK.'];
const MOBILE_MEDIA = '(max-width: 599.95px)';
const MOBILE_WIDTHS = [360, 420, 480, 640, 750, 828, 1080];

const resolveUrl = (url: string) => url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${url}`;
const buildMobileSrcSet = (url: string) =>
  MOBILE_WIDTHS.map((width) => `${buildCloudinaryUrl({ src: url, width })} ${width}w`).join(', ');

export interface ProductDetailBannerProps extends BlockComponentBaseProps {
  section?: SectionBaseProps;
  eyebrow?: string;
  title: string;
  description?: string;
  footnote?: string;
  url?: string;
  image: SharedImageType;
  mobileImage?: SharedImageType;
  button?: SharedButtonType;
}

const ProductDetailBanner = ({ section, eyebrow, title, description, footnote, url, image, mobileImage, button }: ProductDetailBannerProps) => {
  if (!title || !image?.data?.attributes?.url) return null;

  const href = url?.trim() || button?.href?.trim() || undefined;
  const imageAttributes = image.data.attributes;
  const mobileUrl = mobileImage?.data?.attributes?.url ? resolveUrl(mobileImage.data.attributes.url) : null;
  const hasStandaloneBannerLink = Boolean(href && !(button?.label && button.href));
  const content = (
    <>
      <div className="absolute inset-0 [&_img]:object-cover [&_img]:object-[72%_center] md:[&_img]:object-center">
        <picture className="contents">
          {mobileUrl ? <source media={MOBILE_MEDIA} srcSet={buildMobileSrcSet(mobileUrl)} sizes="100vw" /> : null}
          <CMSImage src={imageAttributes.url} alt={imageAttributes.alternativeText || title} fill sizes="100vw" />
        </picture>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(115,132,28,0.34)_0%,rgba(161,179,58,0.18)_34%,rgba(255,255,255,0.02)_64%)]" />
      <div className="relative z-1 flex min-h-[inherit] flex-col justify-center px-6 pb-11 pt-6 sm:px-9 sm:pb-12 sm:pt-7 md:px-11 md:pb-[52px] md:pt-8">
        <div className="flex max-w-full flex-col gap-3 md:max-w-[58%] md:gap-4">
          {eyebrow ? <p className="text-xs font-bold uppercase leading-none tracking-[0.18em] text-white/90 sm:text-[13px] md:text-[17px]">{eyebrow}</p> : null}
          <h2 className="max-w-[560px] whitespace-pre-line text-[28px] font-bold uppercase leading-[0.96] tracking-[-0.05em] text-white sm:text-[40px] md:text-[60px] md:leading-[1.05]">{title}</h2>
          {description ? <p className="max-w-[720px] text-[15px] leading-normal text-white/[92%] sm:text-lg md:text-xl md:leading-[1.45]">{description}</p> : null}
          {button?.label && button.href ? (
            <div className="pt-2">
              <Button href={button.href} target={button.target as '_blank' | '_self' | undefined} variant={button.variant ?? 'contained'} arrow={button.arrow === 'none' ? undefined : button.arrow} dataLayerEventId={button.dataLayerEventId} className="min-h-11 rounded-full bg-white px-[18px] font-bold text-text hover:bg-white hover:opacity-95">
                {button.label}
              </Button>
            </div>
          ) : null}
        </div>
        {footnote ? <p className="absolute bottom-5 left-6 right-6 max-w-full text-[11px] leading-[1.6] text-white/[88%] sm:bottom-6 sm:left-9 sm:right-auto sm:text-xs md:bottom-3 md:left-6 md:max-w-[62%] md:text-[13px]">{footnote}</p> : null}
      </div>
    </>
  );

  return (
    <SectionBase {...(section ?? {})}>
      <div className="flex flex-col gap-0">
        <div className="relative min-h-[300px] overflow-hidden bg-[rgb(217,213,212)] shadow-[0_24px_80px_rgba(34,24,21,0.08)] sm:min-h-[360px] md:min-h-[420px]">
          {hasStandaloneBannerLink ? <Link href={href} style={{ display: 'block', minHeight: 'inherit', color: 'inherit' }}>{content}</Link> : content}
        </div>
        <div className="overflow-hidden bg-[linear-gradient(90deg,rgb(147,168,22)_0%,rgb(166,186,35)_24%,rgb(181,201,60)_50%,rgb(164,185,33)_76%,rgb(141,162,18)_100%)] py-[4.8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] md:py-[6.4px]">
          <div className="flex w-max animate-product-banner-marquee pl-5 md:pl-7">
            {[0, 1].map((row) => (
              <div key={row} className="flex shrink-0 flex-row items-center gap-5 pr-5 md:gap-8 md:pr-8">
                {MARQUEE_ITEMS.map((item, index) => <p key={`${row}-${item}-${index}`} className="shrink-0 whitespace-nowrap text-[15px] font-extrabold uppercase leading-none tracking-[-0.04em] text-white md:text-[22px]">{item}</p>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionBase>
  );
};

export default ProductDetailBanner;
