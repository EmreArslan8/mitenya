'use client';

import { useEffect, useRef, useState } from 'react';

const DynamicTitleSection = ({ section }: { section: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const parentRef = useRef<HTMLSpanElement | null>(null);
  const itemsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const updateWidth = () => {
      const parent = parentRef.current;
      if (!parent) return;
      const maxWidth = itemsRef.current.reduce(
        (width, item) => Math.max(width, item?.offsetWidth ?? 0),
        0,
      );
      parent.style.width = `${maxWidth + 12}px`;
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [section]);

  useEffect(() => {
    if (section.length < 2) return;
    const intervalId = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % section.length);
    }, 2000);
    return () => window.clearInterval(intervalId);
  }, [section.length]);

  return (
    <span
      ref={parentRef}
      className="relative mt-1 inline-flex h-[31.2px] w-max items-center justify-center overflow-hidden box-content text-primary sm:h-[41.6px]"
    >
      <span className="mt-auto h-[3px] w-full rounded-sm bg-primary sm:h-1" />
      {section.map((word, index) => (
        <span
          key={`${word}-${index}`}
          ref={(element) => {
            itemsRef.current[index] = element;
          }}
          className={
            'absolute mb-1 whitespace-nowrap text-center font-semibold opacity-0 sm:text-left ' +
            (currentIndex === index ? 'animate-dynamic-title' : '')
          }
        >
          {word}
        </span>
      ))}
    </span>
  );
};

export default DynamicTitleSection;
