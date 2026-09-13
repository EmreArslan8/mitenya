import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Sayaç/nokta rozeti — MUI `<Badge>` yerine.
 *
 * Server component. Ölçüler MUI kaynağından birebir
 * (node_modules/@mui/material/Badge/Badge.js:19-20, 61-77, 109-112):
 *
 *   standart : minWidth/height = RADIUS_STANDARD*2 = 20px · borderRadius 10px
 *              padding 0 6px · fontSize 12px · fontWeight 500 · lineHeight 1
 *   nokta    : RADIUS_DOT*2 = 8px · padding 0
 *   konum    : top 0 · right 0 · transform scale(1) translate(50%,-50%)
 *              transformOrigin '100% 0%' · zIndex 1
 *
 * `invisible` MUI'de rozeti `scale(0)` ile küçültür (DOM'da kalır); burada da
 * öyle — böylece geçiş animasyonu ve düzen davranışı aynı kalır.
 */
export type BadgeProps = {
  children: ReactNode;
  /** Gösterilecek sayı/metin. `dot` ise yok sayılır. */
  content?: ReactNode;
  dot?: boolean;
  invisible?: boolean;
  /**
   * MUI varsayılanı `showZero=false`: içerik 0 iken rozet gizlenir.
   * Aynı davranış korunuyor — sepet/favori sayacı 0'ken rozet çıkmamalı.
   */
  showZero?: boolean;
  /** Rozetin kendisine uygulanır (children'a değil). */
  badgeClassName?: string;
  className?: string;
};

export function Badge({
  children,
  content,
  dot = false,
  invisible = false,
  showZero = false,
  badgeClassName,
  className,
}: BadgeProps) {
  // MUI showZero mantığı: sayısal içerik 0 ise rozet gizlenir.
  const hiddenByZero = !dot && !showZero && content === 0;
  const isHidden = invisible || hiddenByZero;

  return (
    <span className={cn('relative inline-flex shrink-0 align-middle', className)}>
      {children}
      <span
        aria-hidden={isHidden || undefined}
        className={cn(
          'absolute right-0 top-0 z-[1] flex origin-[100%_0%] items-center justify-center',
          'bg-error text-error-contrast-text font-medium leading-none',
          'transition-transform duration-200 ease-in-out',
          dot
            ? 'size-2 rounded-[4px] p-0'
            : 'h-5 min-w-5 rounded-[10px] px-1.5 text-[12px]',
          'translate-x-1/2 -translate-y-1/2',
          isHidden ? 'scale-0' : 'scale-100',
          badgeClassName,
        )}
      >
        {dot ? null : content}
      </span>
    </span>
  );
}

export default Badge;
