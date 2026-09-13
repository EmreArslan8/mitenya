import { cn } from '@/lib/utils/cn';

/**
 * Belirsiz yükleniyor göstergesi — MUI `<CircularProgress>` yerine.
 *
 * Server component. Geometri ve animasyon MUI kaynağından birebir alındı
 * (node_modules/@mui/material/CircularProgress/CircularProgress.js):
 *
 *   viewBox 44×44 (SIZE=44) · varsayılan görsel boyut 40px · thickness 3.6
 *   r = (44 − 3.6) / 2 = 20.2 · stroke-dasharray "80px, 200px"
 *   kök   : spinner-rotate 1.4s linear     infinite
 *   daire : spinner-dash   1.4s ease-in-out infinite
 *
 * Renk `currentColor` — MUI'de `color="inherit"` ile yapılanın karşılığı.
 * Farklı renk isteniyorsa `className="text-..."` verilir.
 */

const SIZE = 44;
const THICKNESS = 3.6;

export type SpinnerProps = {
  /** Dış ölçü (px). MUI varsayılanı 40. */
  size?: number;
  className?: string;
  /**
   * Ekran okuyucuya okunacak metin. Varsayılan "Yükleniyor".
   * `decorative` verilmedikçe gösterge HER ZAMAN duyurulur — MUI
   * CircularProgress da `role="progressbar"` basıyordu ve bazı sayfalarda
   * (ör. /success, /payment) ekrandaki TEK şey bu (review bulgusu).
   */
  label?: string;
  /** Yanında zaten bir metin varsa göstergeyi ekran okuyucudan gizler. */
  decorative?: boolean;
};

export function Spinner({
  size = 40,
  className,
  label = 'Yükleniyor',
  decorative = false,
}: SpinnerProps) {
  return (
    <span
      role={decorative ? undefined : 'progressbar'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      style={{ width: size, height: size }}
      className={cn('inline-block animate-spinner-rotate', className)}
    >
      <svg viewBox={`${SIZE / 2} ${SIZE / 2} ${SIZE} ${SIZE}`} className="block size-full">
        <circle
          cx={SIZE}
          cy={SIZE}
          r={(SIZE - THICKNESS) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={THICKNESS}
          className="animate-spinner-dash [stroke-dasharray:80px,200px]"
        />
      </svg>
    </span>
  );
}

export default Spinner;
