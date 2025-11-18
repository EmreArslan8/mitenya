import { Stack } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import useStyles from './styles';

const ProgressIndicator = ({
  scrollerRef,
  total,
}: {
  scrollerRef: RefObject<HTMLDivElement>;
  total: number;
}) => {
  const styles = useStyles();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const currentImgIndexRef = useRef(0);

  useEffect(() => {
    const scroller = scrollerRef.current; // ⭐️ Cleanup için kopya aldık
    if (!scroller) return;

    const handleImageContainerScroll = () => {
      const scrollPosition = scroller.scrollLeft;
      const vw = window.innerWidth;
      const newCurrent = Math.floor((scrollPosition + vw / 2) / vw);

      if (currentImgIndexRef.current !== newCurrent) {
        currentImgIndexRef.current = newCurrent;
        setCurrentImgIndex(newCurrent);
      }
    };

    scroller.addEventListener("scroll", handleImageContainerScroll);

    return () => {
      scroller.removeEventListener("scroll", handleImageContainerScroll);
    };
  }, [scrollerRef]); // ⭐️ eksik dependency tamamlandı

  return (
    <Stack sx={styles.progressIndicator}>
      {Array.from({ length: total }).map((_, i) => (
        <Stack sx={styles.progressNode(i === currentImgIndex)} key={i} />
      ))}
    </Stack>
  );
};

export default ProgressIndicator;
