'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import { CrossFade } from '@/components/common/CrossFade';
import { R2_IMAGE_PROFILES, r2ImageUrl } from '@/lib/utils/r2';
import formatPrice from '@/lib/utils/formatPrice';
import { Check } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

const SplitPrice = ({ value, currency, className, suffixClassName }: {
  value: number;
  currency: string;
  className: string;
  suffixClassName: string;
}) => {
  const formatted = formatPrice(value, currency);
  const commaIndex = formatted.indexOf(',');
  if (commaIndex === -1) return <span className={className}>{formatted}</span>;
  const main = formatted.slice(0, commaIndex + 1);
  const [decimal, unit] = formatted.slice(commaIndex + 1).trim().split(' ');
  return (
    <span className={className}>
      {main}
      <span className={suffixClassName}><span>{decimal}</span><span>{unit}</span></span>
    </span>
  );
};

type ProductStickyBarProps = {
  imgSrc?: string;
  name?: string;
  price: { currentPrice: number; originalPrice?: number; currency: string };
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  showCheck: boolean;
  onAddToCart: () => void;
};

const ProductStickyBar = ({ imgSrc, name, price, visible, disabled, loading, showCheck, onAddToCart }: ProductStickyBarProps) => {
  const thumbnailProfile = R2_IMAGE_PROFILES.productPdpThumbnail;
  const stickyImgSrc = imgSrc
    ? r2ImageUrl(imgSrc, { width: thumbnailProfile.widths[1], quality: thumbnailProfile.quality, format: thumbnailProfile.format })
    : '';

  if (!visible) return null;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-[1290] flex border-t border-gray-200 bg-bg shadow-[0_-4px_16px_rgba(20,20,20,0.08)] md:top-0 md:bottom-auto md:border-t-0 md:border-b md:shadow-[0_8px_24px_rgba(20,20,20,0.07)]">
      <div className="mx-auto flex w-full max-w-[1340px] items-center justify-between gap-2 overflow-visible px-4 py-2.5 lg:px-6">
        <div className="hidden min-w-0 items-center gap-3 md:flex">
          {stickyImgSrc && <Image src={stickyImgSrc} alt={name ?? 'Ürün'} width={54} height={54} className="size-[54px] shrink-0 rounded-lg border border-gray-200 bg-bg-light object-cover" />}
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="max-w-[460px] truncate text-base leading-[1.2] font-semibold lg:max-w-[720px]">{name}</p>
            <p className="text-xl leading-none font-bold text-text">{formatPrice(price.currentPrice, price.currency)}</p>
          </div>
        </div>
        <div className="flex flex-[65] items-center gap-2 overflow-hidden md:hidden">
          {price.originalPrice && price.originalPrice > price.currentPrice ? (
            <SplitPrice value={price.originalPrice} currency={price.currency}
              className="inline-flex flex-[25] items-start text-xl leading-none font-medium text-text-medium line-through"
              suffixClassName="ml-px inline-flex flex-col text-[10px] leading-[1.1] font-medium" />
          ) : null}
          <SplitPrice value={price.currentPrice} currency={price.currency}
            className="inline-flex flex-[35] items-start text-[30px] leading-none font-bold text-primary"
            suffixClassName="ml-0.5 inline-flex flex-col text-[15px] leading-[1.1] font-bold" />
        </div>
        <Button variant="contained" color="primary" loading={loading} disabled={disabled} onClick={onAddToCart}
          className={cn('h-11 min-w-[140px] rounded-md px-[18px] text-sm font-bold normal-case lg:min-w-[168px]', 'max-md:h-[52px] max-md:flex-[35] max-md:whitespace-nowrap max-md:text-[15px]')}>
          <CrossFade components={[
            { in: showCheck, component: <span className="inline-flex items-center gap-2"><Check />Eklendi</span> },
            { in: !showCheck, component: 'Sepete Ekle' },
          ]} />
        </Button>
      </div>
    </div>
  );
};

export default ProductStickyBar;
