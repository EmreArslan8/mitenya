'use client';

import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import BrandItem from '../../shared/ShopBrand';
import { BlockComponentBaseProps } from '..';
import { SharedImageType } from '../../shared/cmsTypes';

export interface ShopBrandsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  brands: { logo: SharedImageType; url?: string; highlight?: boolean }[];
}

const ShopBrands = ({ section, brands }: ShopBrandsProps) => {
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true, align: 'start', containScroll: false }, [AutoScroll({ speed: 1.2, stopOnInteraction: false, stopOnMouseEnter: false })]);
  const displayBrands = brands.length < 8 ? [...brands, ...brands] : brands;
  return (
    <SectionBase {...section}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {displayBrands.map((brand, index) => <div key={index} className="min-w-0 flex-[0_0_auto] px-6 sm:px-10"><BrandItem {...brand} /></div>)}
        </div>
      </div>
    </SectionBase>
  );
};

export default ShopBrands;
