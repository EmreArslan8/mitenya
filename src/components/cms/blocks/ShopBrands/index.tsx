// components/cms/blocks/ShopBrands/index.tsx
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import BrandItem from '../../shared/ShopBrand';

import { BlockComponentBaseProps } from '..';
import CustomSlider from '@/components/CustomSlider';

export interface ShopBrandsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  brands: {
    logo: any; // SharedImageType (SVG)
    url?: string;
    highlight?: boolean;
  }[];
}

console.log(SectionBase, "sec")

const ShopBrands = ({ section, brands }: ShopBrandsProps) => {
  return (
    <SectionBase {...section}>
     <CustomSlider
  slidesToShow={5}
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

        {brands.map((brand, index) => (
          <BrandItem key={index} {...brand} />
        ))}
      </CustomSlider>
    </SectionBase>
  );
};

export default ShopBrands;
