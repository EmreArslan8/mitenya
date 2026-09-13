import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

/**
 * Etiket/filtre çipi — MUI `<Chip>` yerine.
 *
 * `'use client'` YOK: fonksiyon prop'ları yalnızca client ebeveynlerden gelir,
 * bileşenin kendisi durum tutmaz. Statik kullanımlarda server'da render olur.
 *
 * Ölçüler MUI kaynağından (node_modules/@mui/material/Chip/Chip.js):
 *   yükseklik 32 (small 24) · yarıçap yüksekliğin yarısı · fontSize 13px
 *   etiket iç boşluğu 12px (small 8px) · whiteSpace nowrap
 *   dolgu  bg action.selected = rgba(0,0,0,.08) · metin text.primary = rgba(0,0,0,.87)
 * (`action.selected` ve `text.primary` palette.ts'te tanımlı değil, MUI
 *  varsayılanları; token'a çevrilirse renk kayar — konvansiyon.md §3.)
 *
 * `onDelete` verildiğinde MUI bir silme ikonu basar. Burada gerçek bir
 * `<button>`: klavyeyle erişilebilir ve `aria-label` taşır — MUI'nin
 * `<svg role="button">` yaklaşımından daha doğru.
 */

const chipVariants = cva(
  [
    'inline-flex max-w-full items-center justify-center align-middle',
    'box-border whitespace-nowrap border-0 outline-0',
    'text-[13px] leading-none no-underline',
  ],
  {
    variants: {
      variant: {
        filled: 'bg-black/[8%] text-black/[87%]',
        outlined: 'bg-transparent border border-solid border-black/[23%] text-black/[87%]',
      },
      size: {
        // İç boşluk KÖKTE: dışarıdan gelen `className` twMerge ile ezebilsin
        // diye. Ayrı bir `labelClassName` geçirgen prop'u eklemek yerine
        // (ADR-0002 §11.4) yapı sadeleştirildi.
        medium: 'h-8 rounded-2xl px-3',
        small: 'h-6 rounded-xl px-2',
      },
      clickable: {
        true: 'cursor-pointer transition-colors hover:bg-black/[12%]',
        false: 'cursor-[unset]',
      },
    },
    defaultVariants: { variant: 'filled', size: 'medium', clickable: false },
  },
);

export type ChipProps = VariantProps<typeof chipVariants> & {
  label: ReactNode;
  onClick?: () => void;
  /** Verilirse sağda bir silme düğmesi çıkar. */
  onDelete?: () => void;
  /** Silme düğmesinin ekran okuyucu etiketi. */
  deleteLabel?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Yalnızca ÇALIŞMA ZAMANINDA hesaplanan değerler için (ör. sipariş durumuna
   * göre gelen renk). Statik stil `className` ile verilir.
   */
  style?: React.CSSProperties;
};

export function Chip({
  label,
  variant,
  size = 'medium',
  onClick,
  onDelete,
  deleteLabel = 'Kaldır',
  disabled,
  className,
  style,
}: ChipProps) {
  const content = (
    <>
      <span>{label}</span>
      {onDelete && (
        <button
          type="button"
          aria-label={deleteLabel}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-1 -mr-1 flex size-5 shrink-0 items-center justify-center rounded-full text-black/[26%] transition-colors hover:text-black/[40%]"
        >
          <svg viewBox="0 0 24 24" className="size-full" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
          </svg>
        </button>
      )}
    </>
  );

  const classes = cn(chipVariants({ variant, size, clickable: Boolean(onClick) }), className);

  if (!onClick) return <span className={classes} style={style}>{content}</span>;

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes} style={style}>
      {content}
    </button>
  );
}

export default Chip;
