import { useEffect, useState } from 'react';

const useDimensions = (
  ref: React.MutableRefObject<HTMLElement | null>,
  dependencies: readonly unknown[] = []
) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [offsetWidth, setOffsetWidth] = useState(0);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [offsetLeft, setOffsetLeft] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const handleResize = () => {
      setOffsetWidth(ref.current!.offsetWidth);
      setScrollWidth(ref.current!.scrollWidth);
      setOffsetLeft(ref.current!.offsetLeft);
    };

    const handleScroll = () => {
      setScrollLeft(ref.current!.scrollLeft);
    };

    // initial values
    setOffsetWidth(ref.current!.offsetWidth);
    setScrollWidth(ref.current!.scrollWidth);
    setOffsetLeft(ref.current!.offsetLeft);

    ref.current!.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      ref.current?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [ref.current, ...dependencies]);

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * Math.pow(t, 3) : 1 - 4 * Math.pow(1 - t, 3);

  const scrollBy = (options: {
    top: number;
    left: number;
    behaviour: 'auto' | 'smooth' | 'instant';
  }) => {
    const startTime = performance.now();
    const startScrollLeft = ref.current!.scrollLeft;
    const distance = options.left;

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const fraction = Math.min(1, elapsedTime / 200);
      const easedFraction = easeInOutCubic(fraction);

      ref.current!.scrollLeft = startScrollLeft + distance * easedFraction;

      if (fraction < 1) requestAnimationFrame(animateScroll);
    };

    requestAnimationFrame(animateScroll);
  };

  return { scrollLeft, offsetWidth, scrollWidth, offsetLeft, scrollBy };
};

export default useDimensions;
