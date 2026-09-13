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
