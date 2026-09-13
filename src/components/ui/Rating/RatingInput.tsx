'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Puan GİRDİSİ — MUI `<Rating onChange>` yerine. Salt-okunur sürüm `./index.tsx`.
 *
 * `'use client'` GEREKÇESİ: seçim ve üzerine gelme (hover) durumu.
 *
 * Erişilebilirlik MUI'ye göre daha iyi: her yıldız gerçek bir `<button>`,
 * `aria-label` taşıyor ve `role="radiogroup"` içinde — klavyeyle sekmelenip
 * boşlukla seçilebiliyor. MUI gizli radio input'larla yapıyordu.
 */
const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[1em]">
    <path
      fill="currentColor"
      className={filled ? 'text-warning' : 'text-gray-200'}
      d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
    />
  </svg>
);

export type RatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
  label?: string;
};

export function RatingInput({
  value,
  onChange,
  max = 5,
  className,
  label = 'Puan',
}: RatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <span
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5 text-[28px] leading-none', className)}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} yıldız`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            className="cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className={n <= shown ? 'text-warning' : 'text-gray-200'}>
              <Star filled={n <= shown} />
            </span>
          </button>
        );
      })}
    </span>
  );
}

export default RatingInput;
