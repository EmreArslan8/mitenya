import { cn } from '@/lib/utils/cn';

/**
 * Yıldız puanı — MUI `<Rating>` yerine.
 *
 * SALT OKUNUR sürüm SERVER COMPONENT: PDP'de ve ürün kartında puan göstermek
 * için JS göndermeye gerek yok. Girdi olarak kullanım (yorum formu) ayrı bir
 * client bileşeni ister — Faz 3'te formlarla gelecek.
 *
 * Kısmi yıldız, MUI'deki gibi ikinci bir yıldızın `width` ile kırpılmasıyla
 * değil, `clip-path` ile veriliyor — ek DOM düğümü yok.
 *
 * BOYUT `em` ile: yıldızlar `1em`. MUI de `fontSize` ile boyutlandırıyordu,
 * bu yüzden çağrı yerleri `className="text-[15px] sm:text-[18px]"` yazarak
 * responsive boyut verebiliyor — sabit px prop'uyla bu mümkün olmazdı.
 */
const Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-full', className)}>
    <path
      fill="currentColor"
      d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
    />
  </svg>
);

export type RatingProps = {
  value: number;
  max?: number;
  /** Boyut buradan: yıldızlar 1em, yani `text-[18px]` = 18px yıldız. */
  className?: string;
  /** Ekran okuyucuya okunacak metin; verilmezse "5 üzerinden 4,5" üretilir. */
  label?: string;
};

export function Rating({ value, max = 5, className, label }: RatingProps) {
  const text = label ?? `${max} üzerinden ${value.toLocaleString('tr-TR')}`;

  return (
    <span
      role="img"
      aria-label={text}
      className={cn('inline-flex items-center gap-0.5 text-[18px] leading-none', className)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative block size-[1em]">
            <Star className="text-gray-200" />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden text-warning"
                style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
              >
                <Star />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export default Rating;
