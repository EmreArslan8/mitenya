'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Bağlamsal katman — MUI `<Popover>` yerine.
 *
 * `'use client'`: konumlandırma, dış tıklama ve focus yönetimi Radix'te.
 * `open`/`onOpenChange` verilirse kontrollü, verilmezse kendi durumunu tutar.
 */
export type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /** Açılışta Radix odağı ilk öğeye taşır; `event.preventDefault()` bunu durdurur. */
  onOpenAutoFocus?: (event: Event) => void;
  /** Kapanışta Radix odağı tetikleyiciye geri verir; `event.preventDefault()` bunu durdurur. */
  onCloseAutoFocus?: (event: Event) => void;
};

export function Popover({
  trigger,
  children,
  open,
  onOpenChange,
  align = 'end',
  sideOffset = 8,
  className,
  onMouseEnter,
  onMouseLeave,
  onOpenAutoFocus,
  onCloseAutoFocus,
}: PopoverProps) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          sideOffset={sideOffset}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            'z-[1400] rounded-lg border border-gray-100 bg-white shadow-lg outline-none',
            'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
            className,
          )}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

export default Popover;
