'use client';

import * as RadixSelect from '@radix-ui/react-select';
import { ReactNode } from 'react';
import { ChevronDown } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

/**
 * Açılır seçim — MUI `<Select>` + `<MenuItem>` yerine.
 *
 * `'use client'` GEREKÇESİ: açık/kapalı durumu, klavye gezinmesi ve
 * konumlandırma Radix'te.
 *
 * MUI'ye göre kazanç: Radix listeyi portal'a basar ve `aria-activedescendant`,
 * tip-ahead, ok tuşları, Home/End, Escape'i kendisi yönetir.
 *
 * Kontrollü kullanım: `value` + `onValueChange`. MUI'nin `onChange(e)` imzası
 * yerine doğrudan değer geliyor — çağrı yerleri buna göre sadeleşir.
 */

/** Radix boş string'i "seçim yok" olarak kullanıyor; öğe değeri olamaz. */
const CLEAR_VALUE = '__clear__';

export type SelectProps = {
  /** Tetikleyicinin DOM id'si — `<label htmlFor>` bağı için. */
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Tetikleyici düğmeye uygulanır. */
  className?: string;
  contentClassName?: string;
  'aria-label'?: string;
  /**
   * Tetikleyicinin içeriğini tamamen devralır — MUI'nin `renderValue`
   * karşılığı. Bir SLOT'tur (içerik), stil geçirgen prop'u değil:
   * seçili değere göre özel bir görünüm çizmek gerektiğinde kullanılır.
   * Verilmezse seçili öğenin metni gösterilir.
   */
  renderValue?: (value: string) => ReactNode;
  /** Tetikleyicideki ok ikonunu gizler. */
  hideIcon?: boolean;
  /**
   * Verilirse listenin başına "seçimi kaldır" öğesi eklenir ve seçilince
   * `onValueChange('')` çağrılır.
   *
   * GEREKÇE: MUI'de `<MenuItem value="">` ile boş seçenek sunulabiliyordu;
   * Radix boş değerli öğeye izin vermez, dolayısıyla kullanıcı bir kez
   * seçtikten sonra seçimi geri alamıyordu (review bulgusu).
   */
  clearLabel?: string;
};

export function Select({
  id,
  value,
  onValueChange,
  children,
  placeholder,
  disabled,
  className,
  contentClassName,
  'aria-label': ariaLabel,
  renderValue,
  hideIcon = false,
  clearLabel,
}: SelectProps) {
  return (
    <RadixSelect.Root
      value={value}
      onValueChange={(next) => onValueChange(next === CLEAR_VALUE ? '' : next)}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg',
          'border border-gray-200 bg-white px-3 text-[16px] text-text sm:text-[14px]',
          'outline-none focus-visible:border-text data-[placeholder]:text-text-light',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        {renderValue ? (
          // asChild yok: Radix'in a11y niteliklerini kaybetmemek için
          // içerik doğrudan tetikleyicinin çocuğu olarak basılıyor.
          <span className="min-w-0 flex-1 text-left">{renderValue(value)}</span>
        ) : (
          <RadixSelect.Value placeholder={placeholder} />
        )}
        {!hideIcon && (
          <RadixSelect.Icon>
            <ChevronDown size={18} className="shrink-0 text-text-light" />
          </RadixSelect.Icon>
        )}
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className={cn(
            'z-[1400] max-h-[min(24rem,var(--radix-select-content-available-height))]',
            'w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg',
            'border border-gray-100 bg-white shadow-lg',
            'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
            contentClassName,
          )}
        >
          <RadixSelect.Viewport className="p-1">
            {clearLabel && value ? (
              <SelectItem value={CLEAR_VALUE} className="text-text-light">
                {clearLabel}
              </SelectItem>
            ) : null}
            {children}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export type SelectItemProps = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function SelectItem({ value, children, disabled, className }: SelectItemProps) {
  return (
    <RadixSelect.Item
      value={value}
      disabled={disabled}
      className={cn(
        'flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-[14px] text-text',
        'outline-none data-[highlighted]:bg-gray-50 data-[state=checked]:font-semibold',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

export default Select;
