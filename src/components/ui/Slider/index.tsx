'use client';

import * as RadixSlider from '@radix-ui/react-slider';
import { cn } from '@/lib/utils/cn';

/**
 * Aralık kaydırıcı — MUI `<Slider>` yerine. Tek kullanım yeri: fiyat filtresi.
 *
 * `'use client'`: sürükleme ve klavye etkileşimi Radix'te (ok tuşları,
 * PageUp/Down, Home/End, `aria-valuenow/min/max`).
 */
export type SliderProps = {
  value: number[];
  onValueChange: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  ariaLabels?: [string, string];
};

export function Slider({
  value,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  ariaLabels = ['Alt sınır', 'Üst sınır'],
}: SliderProps) {
  return (
    <RadixSlider.Root
      value={value}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn('relative flex h-5 w-full touch-none select-none items-center', className)}
    >
      <RadixSlider.Track className="relative h-1 w-full grow rounded-full bg-gray-200">
        <RadixSlider.Range className="absolute h-full rounded-full bg-primary" />
      </RadixSlider.Track>
      {value.map((_, i) => (
        <RadixSlider.Thumb
          key={i}
          aria-label={ariaLabels[i] ?? `Değer ${i + 1}`}
          className={cn(
            'block size-4 rounded-full border-2 border-primary bg-white outline-none',
            'focus-visible:ring-2 focus-visible:ring-primary/40',
            'disabled:cursor-not-allowed',
          )}
        />
      ))}
    </RadixSlider.Root>
  );
}

export default Slider;
