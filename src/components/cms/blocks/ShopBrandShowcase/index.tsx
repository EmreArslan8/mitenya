'use client';

import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { fetchProducts } from '@/lib/api/shop';
import { ShopProductListItemData, ShopSearchOptions } from '@/lib/api/types';
import { useEffect, useMemo, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedButtonType, SharedImageType } from '../../shared/cmsTypes';

export interface ShopBrandShowcaseProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  title: string;
  description: string;
  image: SharedImageType;
  button?: SharedButtonType;
  searchOptions: ShopSearchOptions;
}

const IMAGE_SIZES = '(max-width: 900px) 100vw, 55vw';
const IMAGE_WIDTHS = [384, 768, 1024];
const resolveCmsImageUrl = (src: string) => src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${src}`;
const buildCloudinaryWidthUrl = (src: string, width: number) => {
  const resolved = resolveCmsImageUrl(src);
  return resolved.includes('res.cloudinary.com/') ? resolved.replace('/image/upload/', `/image/upload/f_auto,w_${width}/`) : resolved;
};

const ShopBrandShowcase = ({ section, title, description, image, button, searchOptions: rawSearchOptions }: ShopBrandShowcaseProps) => {
  const [products, setProducts] = useState<ShopProductListItemData[]>([]);
  const [error, setError] = useState(false);
  const searchOptions = useMemo(() => Object.fromEntries(Object.entries(rawSearchOptions).filter(([key, value]) => !['id', 'blockIndex', 'direction', '__component'].includes(key) && Boolean(value))), [rawSearchOptions]);
  const searchKey = JSON.stringify(searchOptions);
  const showcaseImageSrc = buildCloudinaryWidthUrl(image.data.attributes.url, 768);
  const showcaseImageSrcSet = IMAGE_WIDTHS.map((width) => `${buildCloudinaryWidthUrl(image.data.attributes.url, width)} ${width}w`).join(', ');

  useEffect(() => {
    fetchProducts(searchOptions).then((response) => {
      const result = Array.isArray(response) ? response[0] : response;
      if (!result?.products?.length) { setError(true); return; }
      setProducts(result.products);
    }).catch((fetchError) => { console.error('ShopBrandShowcase → fetchProducts error:', fetchError); setError(true); });
  }, [searchOptions, searchKey]);

  if (error) return null;
  return (
    <SectionBase {...section}>
      <div className="w-full py-5">
        <div className="grid grid-cols-1 [grid-template-areas:'image'_'header'_'products'] items-stretch gap-y-4 sm:gap-y-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:[grid-template-areas:'header_header'_'image_products'] md:gap-x-6 md:gap-y-6">
          <div className="relative aspect-[3/2] w-full overflow-hidden [grid-area:image] md:aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={showcaseImageSrc} srcSet={showcaseImageSrcSet} sizes={IMAGE_SIZES} alt={image.data.attributes.alternativeText || title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex flex-row items-start justify-between gap-4 [grid-area:header]">
            <div className="flex max-w-[75%] flex-col gap-0.5">
              <h2 className="text-2xl font-semibold leading-[1.15] tracking-[-0.01em] text-text sm:text-[30px] sm:tracking-[-0.02em] md:text-[34px] md:font-medium md:tracking-[-0.025em]">{title}</h2>
              <p className="text-sm leading-[1.4] text-text-secondary md:text-base">{description}</p>
            </div>
            {button ? (
              <div className="shrink-0 self-start">
                <Button size="small" className="sm:hidden" href={button.href} target={button.target as '_blank' | '_self' | undefined} variant="contained" arrow={button.arrow === 'none' ? undefined : button.arrow} dataLayerEventId={button.dataLayerEventId}>{button.label}</Button>
                <Button size="medium" className="hidden sm:inline-flex" href={button.href} target={button.target as '_blank' | '_self' | undefined} variant={button.variant} arrow={button.arrow === 'none' ? undefined : button.arrow} dataLayerEventId={button.dataLayerEventId}>{button.label}</Button>
              </div>
            ) : null}
          </div>
          <div className="[grid-area:products]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 md:gap-4">
              {products.length ? products.map((product) => <ProductCard data={product} key={product.id} />) : Array.from({ length: 2 }, (_, index) => <ProductCardSkeleton key={index} />)}
            </div>
          </div>
        </div>
      </div>
    </SectionBase>
  );
};

export default ShopBrandShowcase;
