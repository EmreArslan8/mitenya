'use client';

import Link from '@/components/common/Link';
import { ChevronRight } from '@/components/icons';
import { ShopSearchOptions } from '@/lib/api/types';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';

export interface ShopFeatureCardProps {
  image: SharedImageType;
  variant: 'default' | 'compact';
  title?: string;
  description?: string;
  searchOptions?: ShopSearchOptions;
  url?: string;
}

const ShopFeatureCard = ({ image, variant = 'default', title, description, searchOptions, url }: ShopFeatureCardProps) => {
  const pathname = usePathname();
  const shouldUseFrame = variant === 'default' && ['', '/men', '/home-appliances', '/shoes', '/mom-child'].includes(pathname);
  const compact = variant === 'compact';

  return (
    <Link href={searchOptions ? searchUrlFromOptions({ ...searchOptions, nt: true }) : url}>
      <article className={cn('h-full', compact ? 'rounded-xl border' : 'rounded-lg', shouldUseFrame && 'mt-2')}>
        <div className={cn('relative flex items-start text-inherit no-underline', compact ? 'min-h-14 flex-row items-center gap-2 bg-bg-light p-2 sm:gap-3' : 'flex-col gap-2')}>
          {shouldUseFrame ? <div className={cn('absolute -top-1 inset-x-0 overflow-hidden rounded-[9.6px]', title || description ? 'bottom-0' : '-bottom-1')}><Image src="/static/images/frame.png" fill sizes={compact ? '48px' : '(min-width: 1200px) 280px, 40vw'} alt="" /></div> : null}
          {image?.data ? (
            <div className={cn('relative shrink-0 overflow-hidden rounded-lg', compact ? 'h-9 w-9 sm:h-12 sm:w-12' : 'aspect-[1.4] w-full', shouldUseFrame && 'scale-90')}>
              <CMSImage src={image.data.attributes.url} alt={image.data.attributes.alternativeText || title || 'Ürün görseli'} fill sizes={compact ? '(min-width: 600px) 48px, 36px' : '(min-width: 1200px) 280px, 40vw'} className="object-contain" />
            </div>
          ) : <div />}
          {title || description ? (
            <div className={cn('flex w-full flex-row items-center justify-between', compact ? 'rounded-b-xl' : 'absolute bottom-0 rounded-b-lg bg-bg-contrast-text px-2 py-1 text-bg-dark [mix-blend-mode:hard-light] sm:px-3 sm:py-1.5')}>
              <div>
                <p className={cn('line-clamp-2 overflow-hidden text-[13px] leading-[1.2] sm:text-sm', !compact && 'line-clamp-1 leading-normal')}>{title}</p>
                <p className="line-clamp-1 overflow-hidden text-[11px] sm:text-xs">{description}</p>
              </div>
              <ChevronRight size={20} />
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
};

export default ShopFeatureCard;
