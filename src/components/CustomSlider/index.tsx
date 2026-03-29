import { Button, Stack } from '@mui/material';
import { RefObject, useRef } from 'react';
import Slider, { Settings as ReactSlickSliderSettings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import useStyles from './styles';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomSliderProps extends ReactSlickSliderSettings {
  showControls?: boolean;
  sliderRef?: RefObject<Slider>;
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
  sliderRef: externalRef,
  ...rest
}: CustomSliderProps) => {
  const internalRef = useRef<Slider>(null);
  const sliderRef = externalRef ?? internalRef;
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
            onClick={() => sliderRef.current?.slickPrev()}
            sx={styles.prevButton}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </Button>

          <Button
            color="neutral"
            size="small"
            variant="outlined"
            onClick={() => sliderRef.current?.slickNext()}
            sx={styles.nextButton}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </Button>
        </>
      )}
    </Stack>
  );
};

export default CustomSlider;
