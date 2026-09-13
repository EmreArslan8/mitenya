import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

const ProgressIndicator = ({
  scrollerRef,
  total,
}: {
  scrollerRef: MutableRefObject<HTMLDivElement | null>;
  total: number;
}) => {
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
    <div className="flex items-center justify-center gap-2.5 px-1 py-1">
      {Array.from({ length: total }).map((_, i) => (
        <span className={cn('h-2 rounded-full transition-[width,background-color] duration-200', i === currentImgIndex ? 'w-7 bg-[#111]' : 'w-2 bg-[#D8D2CC]')} key={i} />
      ))}
    </div>
  );
};

export default ProgressIndicator;
