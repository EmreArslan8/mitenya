import Icon from '@/components/Icon';
import useScreen from '@/lib/hooks/useScreen';
import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopBannerItem from '../../shared/ShopBannerItem';
import { SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';
export interface ShopBannersProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  banners: { image: SharedImageType; mobileImage: SharedImageType; url: string }[];
}

const ShopBanner = ({ section, banners }: ShopBannersProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    centerMode: isMobile,
    centerPadding: '16px',
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
    pauseOnHover: true,
  };

  const goToNextSlide = () => sliderRef.current?.slickNext();
  const goToPrevSlide = () => sliderRef.current?.slickPrev();

  return (
    <SectionBase {...section}>
      {banners.length > 1 ? (
        <Stack sx={styles.sliderContainer}>
          <Slider {...settings} ref={sliderRef}>
            {banners.map((banner) => (
              <ShopBannerItem
                url={banner.url}
                image={isMobile && banner.mobileImage?.data ? banner.mobileImage : banner.image}
                key={
                  isMobile && banner.mobileImage?.data
                    ? banner.mobileImage.data.attributes.url
                    : banner.image.data.attributes.url
                }
                sx={{ px: { xs: 0.5, sm: 0 } }}
              />
            ))}
          </Slider>
          <Button
            color="neutral"
            size="small"
            variant="tonal"
            onClick={goToPrevSlide}
            sx={styles.prevButton}
          >
            <Icon name="chevron_left" color="white" fontSize={26} sx={{ mr: '2px' }} />
          </Button>
          <Button
            color="neutral"
            size="small"
            variant="tonal"
            onClick={goToNextSlide}
            sx={styles.nextButton}
          >
            <Icon name="chevron_right" color="white" fontSize={26} sx={{ ml: '2px' }} />
          </Button>
        </Stack>
      ) : (
        <ShopBannerItem
          url={banners[0]?.url}
          image={
            isMobile && banners[0]?.mobileImage?.data ? banners[0].mobileImage : banners[0]?.image
          }
          key={
            isMobile && banners[0]?.mobileImage?.data
              ? banners[0]?.mobileImage.data.attributes.url
              : banners[0]?.image.data.attributes.url
          }
          sx={{ borderRadius: { xs: 1, sm: 2 }, overflow: 'clip' }}
        />
      )}
    </SectionBase>
  );
};

export default ShopBanner;
