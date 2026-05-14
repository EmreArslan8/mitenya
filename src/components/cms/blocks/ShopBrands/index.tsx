'use client';

import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import BrandItem from '../../shared/ShopBrand';
import { BlockComponentBaseProps } from '..';
import { SharedImageType } from '../../shared/cmsTypes';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { Box } from '@mui/material';

export interface ShopBrandsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  brands: {
    logo: SharedImageType;
    url?: string;
    highlight?: boolean;
  }[];
}

const ShopBrands = ({ section, brands }: ShopBrandsProps) => {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: 'start', containScroll: false },
    [AutoScroll({ speed: 1.2, stopOnInteraction: false, stopOnMouseEnter: false })],
  );

  // Yeterli slide olmazsa Embla loop seamless çalışmaz, duplicate et
  const displayBrands = brands.length < 8 ? [...brands, ...brands] : brands;

  return (
    <SectionBase {...section}>
      <Box ref={emblaRef as React.Ref<HTMLDivElement>} sx={{ overflow: 'hidden' }}>
        <Box sx={{ display: 'flex' }}>
          {displayBrands.map((brand, index) => (
            <Box key={index} sx={{ flex: '0 0 auto', minWidth: 0, px: { xs: 3, sm: 5 } }}>
              <BrandItem {...brand} />
            </Box>
          ))}
        </Box>
      </Box>
    </SectionBase>
  );
};

export default ShopBrands;
