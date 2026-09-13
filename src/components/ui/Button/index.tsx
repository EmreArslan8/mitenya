'use client';

import type { VariantProps } from 'class-variance-authority';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import { sendButtonClickEvent } from '@/lib/utils/googleAnalytics';
import { Spinner } from '@/components/ui/Spinner';
import { buttonVariants } from './variants';

/**
 * Buton — MUI `<Button>` / `components/common/Button` yerine.
 *
 * `'use client'` GEREKÇESİ: onClick (62 çağrı yerinde), useRouter ve
 * analytics olayı gerektiriyor. Yaprak seviyede client kalıyor.
 *
 * Eski sarmalayıcıdan iki fark:
 *  1. `props: any` gitti — gerçek kullanım tiplendi.
 *  2. `loading` ARTIK ÇALIŞIYOR. Eskisi (`common/Button/index.tsx:22`)
 *     `loading: _loading` diye alıp yok sayıyordu; 16 çağrı yeri
 *     yükleniyor durumu gösterdiğini sanıyordu, göstermiyordu.
 */

const ARROW_SIZE = { small: 16, medium: 22, large: 24 } as const;

type Size = keyof typeof ARROW_SIZE;

export type ButtonProps = VariantProps<typeof buttonVariants> & {
  children?: React.ReactNode;
  className?: string;
  /** Başa/sona chevron ikonu koyar. */
  arrow?: 'start' | 'end';
  /** Verilirse tıklamada router.push edilir. */
  href?: string;
  target?: '_blank' | '_self';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  /** Spinner gösterir, butonu devre dışı bırakır, aria-busy işaretler. */
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  /** Verilirse tıklamada GA olayı gönderilir. */
  dataLayerEventId?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
};

export function Button({
  children,
  className,
  variant,
  color,
  size,
  fullWidth,
  arrow,
  href,
  target,
  type = 'button',
  disabled,
  loading,
  startIcon,
  endIcon,
  dataLayerEventId,
  onClick,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const router = useRouter();
  const isDisabled = disabled || loading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (dataLayerEventId) sendButtonClickEvent(dataLayerEventId);
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!href) return;
    if (target === '_blank') {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    router.push(href);
  };

  const iconSize = ARROW_SIZE[(size ?? 'medium') as Size];

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={cn(buttonVariants({ variant, color, size, fullWidth }), className)}
    >
      {loading ? <Spinner size={iconSize} decorative /> : arrow === 'start' ? <ChevronLeft size={iconSize} /> : startIcon}
      {children}
      {arrow === 'end' ? <ChevronRight size={iconSize} /> : endIcon}
    </button>
  );
}

export default Button;
