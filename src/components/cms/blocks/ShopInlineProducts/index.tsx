'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { DoubleChevronLeft, DoubleChevronRight } from '@/components/icons';
import { fetchProducts } from '@/lib/api/shop';
import { ShopProductListItemData, ShopSearchOptions } from '@/lib/api/types';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { cn } from '@/lib/utils/cn';
import { useEffect, useMemo, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';

const MIN_PRODUCTS = 4;
const RENDER_LIMIT = 4;

export interface ShopInlineProductsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  searchOptions: ShopSearchOptions;
  cta: string;
  displayType: 'slider' | 'grid';
}

const ShopInlineProducts = ({ section, searchOptions: rawSearchOptions, cta, displayType }: ShopInlineProductsProps) => {
  const [products, setProducts] = useState<ShopProductListItemData[]>([]);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, slidesToScroll: 1, align: 'start' }, [Autoplay({ delay: 3200, stopOnMouseEnter: true, stopOnInteraction: false })]);
  const searchOptions = useMemo(() => Object.fromEntries(Object.entries(rawSearchOptions).filter(([key, value]) => !['id', 'blockIndex', 'direction', '__component'].includes(key) && Boolean(value))) as Partial<ShopSearchOptions>, [rawSearchOptions]);
  const searchOptionsKey = JSON.stringify(searchOptions);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    const mergeUniqueById = (base: ShopProductListItemData[], incoming: ShopProductListItemData[]) => {
      const ids = new Set(base.map((product) => product.id));
      return [...base, ...incoming.filter((product) => !ids.has(product.id))];
    };

    fetchProducts(searchOptions).then(async (response) => {
      const result = Array.isArray(response) ? response[0] : response;
      if (!result?.products) { setError(true); return; }
      let nextProducts = result.products;
      if (nextProducts.length < MIN_PRODUCTS) {
        const fallbackOptions = { ...searchOptions };
        delete fallbackOptions.query;
        try {
          const fallbackResponse = await fetchProducts(fallbackOptions);
          const fallbackResult = Array.isArray(fallbackResponse) ? fallbackResponse[0] : fallbackResponse;
          nextProducts = mergeUniqueById(nextProducts, fallbackResult?.products ?? []);
          if (nextProducts.length < MIN_PRODUCTS) {
            const globalResponse = await fetchProducts({});
            const globalResult = Array.isArray(globalResponse) ? globalResponse[0] : globalResponse;
            nextProducts = mergeUniqueById(nextProducts, globalResult?.products ?? []);
          }
        } catch (fallbackError) {
          console.error('InlineProducts → fallback error:', fallbackError);
        }
      }
      if (!nextProducts.length) { setError(true); return; }
      setProducts(nextProducts.slice(0, Math.max(MIN_PRODUCTS, nextProducts.length)));
    }).catch((fetchError) => { console.error('InlineProducts → fetchProducts error:', fetchError); setError(true); });
  }, [searchOptions, searchOptionsKey]);

  if (error) return null;
  const items: React.ReactNode[] = products.length
    ? products.map((product) => <ProductCard data={product} key={product.id} />)
    : Array.from({ length: RENDER_LIMIT }, (_, index) => <ProductCardSkeleton key={index} />);

  return (
    <SectionBase {...section} className="gap-4">
      <div className="flex w-full flex-col items-stretch gap-4">
        {displayType === 'grid' ? (
          <div className="grid grid-cols-2 gap-4 pb-2 md:grid-cols-4 md:gap-8 sm:pb-4">{items.slice(0, RENDER_LIMIT)}</div>
        ) : (
          <div className="relative w-full self-stretch overflow-visible pb-0 sm:pb-4">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {items.map((item, index) => <div key={index} className="box-border h-full min-w-0 shrink-0 basis-1/2 p-1.5 md:basis-1/4 md:p-2">{item}</div>)}
              </div>
            </div>
            <button type="button" aria-label="Önceki" onClick={() => emblaApi?.scrollPrev()} className="absolute -left-[52px] top-1/2 z-1 hidden h-[88px] w-[52px] -translate-y-1/2 items-center justify-center text-gray-800 hover:text-gray-900 sm:flex md:-left-[68px] md:w-[68px]"><DoubleChevronLeft size="38" /></button>
            <button type="button" aria-label="Sonraki" onClick={() => emblaApi?.scrollNext()} className="absolute -right-[52px] top-1/2 z-1 hidden h-[88px] w-[52px] -translate-y-1/2 items-center justify-center text-gray-800 hover:text-gray-900 sm:flex md:-right-[68px] md:w-[68px]"><DoubleChevronRight size="38" /></button>
            <div className="flex flex-row justify-center gap-1.5 pb-1 pt-3 sm:hidden">
              {Array.from({ length: 10 }, (_, index) => <button key={index} type="button" onClick={() => emblaApi?.scrollTo(index)} aria-label={`Slayt ${index + 1}`} className={cn('h-1.5 rounded-full transition-[width,background] duration-200', current === index ? 'w-5 bg-text' : 'w-1.5 bg-text/20 hover:bg-text/35')} />)}
            </div>
          </div>
        )}
        {cta ? <div className="flex items-center justify-center"><Button color="neutral" arrow="end" size="small" variant="tonal" href={searchUrlFromOptions(searchOptions)}>{cta}</Button></div> : null}
      </div>
    </SectionBase>
  );
};

export default ShopInlineProducts;
