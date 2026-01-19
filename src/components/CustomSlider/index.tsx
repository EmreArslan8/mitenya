import { Button, Stack } from '@mui/material';
import { useRef } from 'react';
import Slider, { Settings as ReactSlickSliderSettings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import useStyles from './styles';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
            <ChevronLeft size={20} />
          </Button>

          <Button
            color="neutral"
            size="small"
            variant="outlined"
            onClick={() => sliderRef.current?.slickNext()}
            sx={styles.nextButton}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </Button>
        </>
      )}
    </Stack>
  );
};

export default CustomSlider;
