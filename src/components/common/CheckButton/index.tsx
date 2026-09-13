import { ReactNode } from 'react';
import { Check } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

/**
 * Seçili/seçili değil düğmesi — MUI `<ToggleButton>` yerine (ADR-0002 Faz 2).
 *
 * `'use client'` YOK: `onClick` client ebeveynlerden geliyor, bileşen durum
 * tutmuyor. Ürün varyantlarında bir kısmı `<Link>` içinde salt gezinti.
 *
 * Erişilebilirlik MUI'ye göre daha doğru: `aria-pressed` ile gerçek bir
 * iki durumlu düğme. MUI ToggleButton da bunu yapıyordu; buradaki fark
 * ~40 KB'lık `@mui/material` ToggleButton ağacının gitmesi.
 *
 * Ölçüler `theme.ts:243-294` MuiToggleButton override'ından taşındı.
 */
export interface CheckButtonProps {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium';
  /** İkon gösterimini kapatır (ör. alanın dar olduğu yerler). */
  noIcon?: boolean;
  className?: string;
}

const CheckButton = ({
  children,
  selected = false,
  disabled = false,
  onClick,
  size = 'medium',
  noIcon = false,
  className,
}: CheckButtonProps) => (
  <button
    type="button"
    aria-pressed={selected}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1',
      'min-w-11 rounded-lg border border-text-light bg-white uppercase',
      'transition-colors outline-none',
      size === 'small' ? 'h-9 px-3 text-[13px]' : 'h-11 px-4 text-[14px]',
      selected ? 'border-text bg-bg-light font-bold text-text' : 'text-text-medium',
      disabled && 'cursor-not-allowed opacity-50',
      className,
    )}
  >
    {!noIcon && selected && <Check size={size === 'small' ? 22 : 24} />}
    {children}
  </button>
);

export default CheckButton;
