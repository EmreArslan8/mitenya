import { cn } from '@/lib/utils/cn';

/**
 * Yükleniyor yer tutucusu — MUI `<Skeleton>` yerine.
 *
 * Server component, çalışma zamanı yok.
 *
 * Stiller MUI kaynağından BİREBİR alındı
 * (node_modules/@mui/material/Skeleton/Skeleton.js:75-96) — göz kararı değil:
 *
 *   kök       display:block · bg alpha(text.primary, .11) · height 1.2em
 *   text      height auto · transform scale(1,.60) · transform-origin 0 55%
 *             border-radius 8px/13.3px (= shape 8px, 8/0.6 yuvarlanmış)
 *             boşken &nbsp; basar (yüksekliği line-height'tan alır)
 *   circular  border-radius %50
 *   rounded   border-radius 8px (theme.shape)
 *   rectangular border-radius 2px  ← projeye özel: theme.ts:355 override'ı
 *
 * Animasyon `--animate-skeleton` (globals.css) — MUI'nin
 * `2s ease-in-out 0.5s infinite`, opacity 1→0.4→1 ritmi.
 * Tailwind'in `animate-pulse`u farklıdır, kullanılmıyor.
 */

const VARIANT = {
  text: 'h-auto my-0 origin-[0_55%] scale-y-[0.6] [border-radius:8px/13.3px]',
  circular: 'rounded-full',
  rounded: 'rounded-lg',
  rectangular: 'rounded-[2px]',
} as const;

export type SkeletonProps = {
  variant?: keyof typeof VARIANT;
  /** Sayı verilirse px. Dinamik olduğu için inline style ile uygulanır. */
  width?: number | string;
  height?: number | string;
  className?: string;
};

export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width, height }}
      className={cn(
        'block h-[1.2em] bg-black/[11%] animate-skeleton',
        VARIANT[variant],
        className,
      )}
    >
      {/* MUI'nin `&:empty:before { content: "\00a0" }` kuralının karşılığı:
          text varyantı boşken yüksekliğini bu boşluk karakterinden alır. */}
      {variant === 'text' ? '\u00a0' : null}
    </span>
  );
}

export default Skeleton;
