'use client';

import * as RadixAccordion from '@radix-ui/react-accordion';
import { ReactNode } from 'react';
import { ChevronDown } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

/**
 * Açılır bölüm — MUI `<Accordion>` / `<AccordionSummary>` / `<AccordionDetails>`
 * üçlüsünün karşılığı.
 *
 * `'use client'` GEREKÇESİ: açık/kapalı durumu ve klavye gezinmesi Radix'te.
 *
 * Radix'in getirdikleri: `aria-expanded`, `aria-controls`, ok tuşlarıyla
 * gezinme, Home/End, `data-[state]` ile CSS animasyonu.
 *
 * Yükseklik animasyonu Radix'in ölçtüğü `--radix-accordion-content-height`
 * değişkeniyle; süre/eğri MUI varsayılanıyla aynı (300ms ease-in-out).
 *
 * `type`:
 *   `multiple` — birden çok bölüm aynı anda açık kalabilir (bağımsız accordion'lar)
 *   `single`   — biri açılınca diğeri kapanır (MUI'de `expanded === index` deseni)
 *
 * DİKKAT: `single` gerçek bir davranış farkıdır. `ProductDescription` ve
 * `ProductDetailTabs` MUI'de tek seçimliydi; review'de fark edildi ve
 * `type="single"` verildi.
 */

export type AccordionProps = {
  children: ReactNode;
  /** Açık başlamasını istediğin öğelerin `value`'ları. */
  defaultValue?: string[];
  /** `single` = biri açılınca diğeri kapanır. Varsayılan: `multiple`. */
  type?: 'single' | 'multiple';
  /** `single` iken açık bölüme tekrar tıklayınca kapanabilsin mi. */
  collapsible?: boolean;
  className?: string;
};

export function Accordion({
  children,
  defaultValue,
  type = 'multiple',
  collapsible = true,
  className,
}: AccordionProps) {
  if (type === 'single') {
    return (
      <RadixAccordion.Root
        type="single"
        collapsible={collapsible}
        defaultValue={defaultValue?.[0]}
        className={className}
      >
        {children}
      </RadixAccordion.Root>
    );
  }

  return (
    <RadixAccordion.Root type="multiple" defaultValue={defaultValue} className={className}>
      {children}
    </RadixAccordion.Root>
  );
}

export type AccordionItemProps = {
  /** Öğeyi tanımlayan benzersiz anahtar. */
  value: string;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  /** Başlıktaki ok ikonunu gizler (ör. ok başka yerde gösteriliyorsa). */
  hideChevron?: boolean;
};

export function AccordionItem({
  value,
  trigger,
  children,
  className,
  triggerClassName,
  contentClassName,
  hideChevron = false,
}: AccordionItemProps) {
  return (
    <RadixAccordion.Item value={value} className={className}>
      <RadixAccordion.Header className="flex">
        <RadixAccordion.Trigger
          className={cn(
            'group flex w-full cursor-pointer items-center justify-between gap-2 text-left',
            triggerClassName,
          )}
        >
          {trigger}
          {!hideChevron && (
            <ChevronDown
              size={24}
              className="shrink-0 transition-transform duration-150 group-data-[state=open]:rotate-180"
            />
          )}
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>

      <RadixAccordion.Content
        className={cn(
          'overflow-hidden',
          'data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up',
          contentClassName,
        )}
      >
        {children}
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
}

export default Accordion;
