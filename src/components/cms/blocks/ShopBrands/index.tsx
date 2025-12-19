// components/cms/blocks/ShopBrands/index.tsx
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import BrandItem from '../../shared/ShopBrand';

import { BlockComponentBaseProps } from '..';
import CustomSlider from '@/components/CustomSlider';
import useScreen from '@/lib/hooks/useScreen';

export interface ShopBrandsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  brands: {
    logo: any;
    url?: string;
    highlight?: boolean;
  }[];
}

const ShopBrands = ({ section, brands }: ShopBrandsProps) => {
  const { isMobile } = useScreen();
  return (
    <SectionBase {...section}>
      <CustomSlider
        slidesToShow={isMobile ? 2 : 5}
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
