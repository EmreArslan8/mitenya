'use client';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils/cn';
import { Check } from '@/components/icons';

/**
 * Onay kutusu — MUI `<Checkbox>` yerine.
 *
 * `'use client'`: kontrollü durum ve klavye etkileşimi.
 * Radix gerçek bir `<button role="checkbox">` basar; `aria-checked`,
 * boşluk tuşu ve form entegrasyonu hazır gelir.
 *
 * MUI'nin 42px'lik dokunma alanı yerine 20px kutu + 8px iç boşluk kullanılıyor;
 * dokunma hedefi 36px'te kalıyor (WCAG 2.5.8 asgari 24px'i aşıyor).
 */
export type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  /**
   * Tıklama olayı. Kutu, tıklanabilir bir satırın İÇİNDE duruyorsa
   * `e.stopPropagation()` için gerekli — yoksa hem satır hem kutu tetiklenip
   * durum iki kez değişir (Faz 3 review'ünde yakalandı).
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
  onClick,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      id={id}
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-[4px] border-2 border-text-light',
        'outline-none transition-colors',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <RadixCheckbox.Indicator className="text-white">
        <Check size={14} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

export default Checkbox;
