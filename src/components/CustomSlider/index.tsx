import Icon from '@/components/Icon';
import { Button, Stack } from '@mui/material';
import { ReactNode, useRef } from 'react';
import Slider, { Settings as ReactSlickSliderSettings } from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import useStyles from './styles';

interface CustomSliderProps extends ReactSlickSliderSettings {
  showControls?: boolean;
}

const CustomSlider = ({
  children,
  slidesToShow = 5,
  infinite = true,
  speed = 500,
  slidesToScroll = 1,
  swipe = true,
  touchMove = true,
  showControls = true,
  ...rest
}: CustomSliderProps) => {
  const sliderRef = useRef<Slider>(null);

  const goToNextSlide = () => sliderRef.current?.slickNext();
  const goToPrevSlide = () => sliderRef.current?.slickPrev();
  const styles = useStyles();

  return (
    <Stack sx={styles.sliderContainer}>
      <Slider
        ref={sliderRef}
        {...{ slidesToShow, infinite, speed, slidesToScroll, swipe, touchMove }}
        {...rest}
      >
        {children}
      </Slider>
      {showControls && (
        <>
          <Button
            color="neutral"
            size="small"
            variant="outlined"
            onClick={goToPrevSlide}
            sx={styles.prevButton}
          >
            <Icon name="chevron_left" color="neutral" fontSize={26} sx={{ mr: '2px' }} />
          </Button>
          <Button
            color="neutral"
            size="small"
            variant="outlined"
            onClick={goToNextSlide}
            sx={styles.nextButton}
          >
            <Icon name="chevron_right" color="neutral" fontSize={26} sx={{ ml: '2px' }} />
          </Button>
        </>
      )}
    </Stack>
  );
};

export default CustomSlider;
