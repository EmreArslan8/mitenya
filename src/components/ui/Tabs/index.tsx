'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Sekmeler — MUI `<Tabs>` / `<Tab>` yerine.
 *
 * `'use client'`: seçili sekme durumu ve klavye gezinmesi Radix'te
 * (ok tuşları, Home/End, `aria-selected`, `aria-controls`).
 */
export type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange} className={className}>
      {children}
    </RadixTabs.Root>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <RadixTabs.List className={cn('flex items-center gap-2 overflow-x-auto', className)}>
      {children}
    </RadixTabs.List>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={cn(
        'cursor-pointer whitespace-nowrap border-b-2 border-transparent px-3 py-2',
        'text-[14px] text-text-medium outline-none transition-colors',
        'data-[state=active]:border-accentRed data-[state=active]:text-text',
        className,
      )}
    >
      {children}
    </RadixTabs.Trigger>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixTabs.Content value={value} className={cn('outline-none', className)}>
      {children}
    </RadixTabs.Content>
  );
}

export default Tabs;
