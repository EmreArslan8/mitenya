import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Çıplak metin girdisi — MUI `<OutlinedInput>` karşılığı.
 *
 * Etiket/hata/yardım metni İÇERMEZ; onlar `ui/TextField`'ın işi. Bu bileşen
 * yalnızca kutuyu ve slot'ları yönetir (arama kutusu gibi etiketsiz yerler için).
 *
 * Ölçüler `theme.ts:295-345`'ten (MuiOutlinedInput + MuiInputBase):
 *   small  yükseklik 36px · iç boşluk 8px 14px
 *   medium yükseklik 46px
 *   kenarlık `palette.text.light` · yazı `fontWeight 500`
 *   placeholder `text.light`, opacity 1
 *   disabled metin `text.light`
 *   köşe `theme.shape.borderRadius` = 8px
 *
 * İKİ BİLİNÇLİ SAPMA:
 *
 * 1. **Mobilde 16px yazı.** MUI'de 14px'ti; iOS Safari 16px altındaki girdiye
 *    odaklanınca sayfayı zoomluyor. `text-[16px] sm:text-[14px]` ile mobilde
 *    16'ya çıkarıldı, sm ve üstünde MUI değerine dönülüyor. (Karar: 2026-09-08)
 *
 * 2. **Odak göstergesi.** MUI odakta kenarlığı 2px yapıyordu; bu 1px'lik düzen
 *    kayması yaratır. Yerine kenarlık rengi + `ring` kullanıldı — kayma yok,
 *    görünürlük daha iyi.
 */

/**
 * Yükseklik ölçeği. `large` (48px) FORM alanlarının standardıdır —
 * dönüşümde 6 dosya bu kararı kendi içinde taşıyordu (52/48/36 arasında
 * ayrışmış hâlde); tek yere alındı (ADR-0002 §11.1).
 */
const SIZE = {
  small: 'h-9 px-3.5 py-2',
  medium: 'h-[46px] px-3.5',
  large: 'h-auto min-h-12 px-3 [&_input]:py-[13px]',
} as const;

/**
 * Görünüm ailesi:
 *   outlined — beyaz zemin + kenarlık (varsayılan)
 *   soft     — dolgulu form alanı; MUI'de `#F7F7F8` idi, token'a
 *              (gray-50 = #F5F5F7) çekildi: 2 birimlik fark, hard-coded hex gitti.
 */
const VARIANT = {
  outlined: 'bg-white border-text-light',
  soft: 'bg-gray-50 border-black/[12%]',
} as const;

export type InputProps = {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'search' | 'url';
  value?: string | number;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  inputMode?: 'text' | 'tel' | 'numeric' | 'email' | 'search' | 'decimal';
  maxLength?: number;
  size?: keyof typeof SIZE;
  variant?: keyof typeof VARIANT;
  /** Hata durumu — kenarlık rengini değiştirir ve `aria-invalid` verir. */
  error?: boolean;
  /** Hata/yardım metninin id'si — `aria-describedby` için. */
  describedBy?: string;
  /** Girdinin SOLUNDA duran içerik (ör. para birimi). */
  startSlot?: ReactNode;
  /** Girdinin SAĞINDA duran içerik (ör. karakter sayacı, göster/gizle). */
  endSlot?: ReactNode;
  className?: string;
  inputClassName?: string;
  'aria-label'?: string;
  /** Çok satırlı alan — `<textarea>` basar (MUI `multiline` karşılığı). */
  multiline?: boolean;
  /** `multiline` ile birlikte: en az satır sayısı. */
  minRows?: number;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'small',
    variant = 'outlined',
    error = false,
    describedBy,
    startSlot,
    endSlot,
    className,
    inputClassName,
    disabled,
    multiline = false,
    minRows = 3,
    ...props
  },
  ref,
) {
  const fieldClassName = cn(
    'min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-medium text-text outline-none',
    'text-[16px] sm:text-[14px]',
    'placeholder:text-text-light placeholder:opacity-100',
    'disabled:cursor-not-allowed disabled:text-text-light',
    inputClassName,
  );

  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border transition-colors',
        'focus-within:ring-2 focus-within:ring-primary/30',
        VARIANT[variant],
        // Odak rengi HER YERDE primary. MUI'de bazı form alanları odakta
        // kırmızıya (#C1121F = error) dönüyordu; kırmızı hata demektir,
        // odak demek değil. Bilinçli düzeltme.
        error ? 'border-error focus-within:border-error' : 'focus-within:border-primary',
        disabled && 'cursor-not-allowed opacity-70',
        // Çok satırlıda sabit yükseklik yerine dikey iç boşluk.
        multiline ? 'h-auto items-start px-3.5 py-2' : SIZE[size],
        className,
      )}
    >
      {startSlot}
      {multiline ? (
        <textarea
          ref={ref as unknown as React.Ref<HTMLTextAreaElement>}
          rows={minRows}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          className={cn(fieldClassName, 'resize-y py-0')}
          {...(props as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          className={fieldClassName}
          {...props}
        />
      )}
      {endSlot}
    </div>
  );
});

export default Input;
