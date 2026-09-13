import useScrollPosition from '@/lib/hooks/useScrollPosition';
import { ChevronUp } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

interface ScrollToTopButtonProps {
  threshold?: number;
}

const ScrollToTopButton = ({ threshold = 500 }: ScrollToTopButtonProps) => {
  const scrollPosition = useScrollPosition();
  const show = scrollPosition > threshold;
  return (
    <button
      type="button"
      aria-label="Sayfanın başına dön"
      className={cn(
        'fixed right-4 z-10 grid size-10 cursor-pointer place-items-center rounded-lg border border-primary-dark bg-primary-dark p-2.5 text-primary-contrast-text shadow-[0_0_10px_rgba(255,255,255,0.125)] transition-[bottom] duration-300 sm:right-6',
        show ? 'bottom-[62px] sm:bottom-[86px]' : 'bottom-[-50px]',
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ChevronUp size={20} />
    </button>
  );
};

export default ScrollToTopButton;
