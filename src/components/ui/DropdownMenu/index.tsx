'use client';

import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Açılır menü — MUI `<Menu>` + `<MenuItem>` yerine.
 *
 * `'use client'`: açık/kapalı durumu, klavye gezinmesi ve konumlandırma Radix'te.
 * MUI'de `anchorEl` state'i elle tutuluyordu; Radix tetikleyiciyi kendi bulur —
 * çağrı yerlerinden `useState<null | HTMLElement>` kalıbı kalkar.
 */
export type DropdownMenuProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
  triggerClassName?: string;
};

export function DropdownMenu({
  trigger,
  children,
  align = 'end',
  className,
  triggerClassName,
}: DropdownMenuProps) {
  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger asChild className={triggerClassName}>
        {trigger}
      </RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          align={align}
          sideOffset={4}
          className={cn(
            'z-[1400] min-w-[180px] overflow-hidden rounded-lg border border-gray-100 bg-white p-1 shadow-lg',
            'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
            className,
          )}
        >
          {children}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
}

export type DropdownMenuItemProps = {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
};

export function DropdownMenuItem({
  children,
  onSelect,
  disabled,
  className,
}: DropdownMenuItemProps) {
  return (
    <RadixMenu.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-[14px] text-text',
        'outline-none data-[highlighted]:bg-gray-50',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
    >
      {children}
    </RadixMenu.Item>
  );
}

export default DropdownMenu;
