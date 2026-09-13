'use client';

import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from '@/lib/utils/cn';

/**
 * Aç/kapa anahtarı — MUI `<Switch>` yerine.
 *
 * `'use client'`: kontrollü durum.
 * Ölçüler MUI'nin varsayılan (medium) anahtarına yakın tutuldu: 34×14 ray,
 * 20px topuz. Radix `role="switch"` + `aria-checked` veriyor.
 */
export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <RadixSwitch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'bg-gray-300 transition-colors outline-none',
        'data-[state=checked]:bg-primary',
        'focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <RadixSwitch.Thumb
        className={cn(
          'block size-5 rounded-full bg-white shadow transition-transform',
          'translate-x-0 data-[state=checked]:translate-x-5',
        )}
      />
    </RadixSwitch.Root>
  );
}

export default Switch;
