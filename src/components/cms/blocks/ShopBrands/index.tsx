'use client';

// components/cms/blocks/ShopBrands/index.tsx
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import BrandItem from '../../shared/ShopBrand';

import { BlockComponentBaseProps } from '..';
import CustomSlider from '@/components/CustomSlider';
import useScreen from '@/lib/hooks/useScreen';
import { SharedImageType } from '../../shared/cmsTypes';

export interface ShopBrandsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  brands: {
    logo: SharedImageType;
    url?: string;
    highlight?: boolean;
  }[];
}

const ShopBrands = ({ section, brands }: ShopBrandsProps) => {
  const { isMobile } = useScreen();
  const slidesToShow = isMobile ? 2 : 5;
  const hasEnoughItemsToScroll = brands.length > slidesToShow;
  const sliderBrands = hasEnoughItemsToScroll ? brands : [...brands, ...brands];

  return (
    <SectionBase {...section}>
      <CustomSlider
        slidesToShow={slidesToShow}
        slidesToScroll={1}
        infinite
        autoplay
        autoplaySpeed={1}
        speed={10000}
        cssEase="linear"
        arrows={false}
        dots={false}
        pauseOnHover={false}
        swipe={false}
        touchMove={false}
        showControls={false}
      >
        {sliderBrands.map((brand, index) => (
          <BrandItem key={index} {...brand} />
        ))}
      </CustomSlider>
    </SectionBase>
  );
};

export default ShopBrands;
