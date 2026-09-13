'use client';

import { useState } from 'react';
import Markdown from '@/components/common/Markdown';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Stack } from '@/components/ui/Stack';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Typography } from '@/components/ui/Typography';
import { Minus, Plus } from '@/components/icons';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';

/**
 * SSS bloğu — ADR-0002 Faz 2'de MUI Tabs + Accordion'dan Radix'e taşındı.
 *
 * Strapi sözleşmesi DEĞİŞMEDİ: `blocks.faq` anahtarı ve prop imzası aynı.
 *
 * Stil dönüşümü (eski styles.ts, silindi):
 *   container gap 2 -> gap-4 · items borderTop gray.200 -> border-t border-gray-200
 *   accordion borderBottom gray.200 -> border-b border-gray-200
 *   summary py {xs:1.75, sm:2.25} -> py-3.5 sm:py-[18px]
 *   title pr 2 -> pr-4, fontWeight 600, lineHeight 1.35
 *   details pb {xs:2, sm:2.5} -> pb-4 sm:pb-5
 *   category px 1 -> px-2, textTransform none
 *
 * `'use client'` GEREKÇESİ: seçili kategori ve açık/kapalı durumu.
 */

export interface FAQProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  categories: string;
  items: { title: string; description: string; categories: string }[];
}

const FAQ = ({ section, categories: unparsedCategories, items: unparsedItems }: FAQProps) => {
  const categories = unparsedCategories.split(',').map((c) => c.trim());
  const items = unparsedItems.map((p) => ({
    ...p,
    categories: p.categories.split(',').map((c) => c.trim()),
  }));

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const filteredItems = items.filter((item) => item.categories.includes(selectedCategory));

  return (
    <SectionBase {...section}>
      <Stack gap={2} className="w-full">
        {categories.length > 1 && (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              {categories.map((c) => (
                <TabsTrigger key={c} value={c} className="rounded-lg px-2 normal-case">
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* `key` kategoriye bağlı: eskiden öğeler kategori değişince
            remount olup kapanıyordu. Radix kökü uncontrolled olduğu için
            key verilmezse açık durum kategoriler arasında taşınır
            (review bulgusu). */}
        <Accordion key={selectedCategory} className="w-full border-t border-gray-200">
          {filteredItems.map((item, index) => (
            <FAQItem
              key={item.title + item.description + selectedCategory}
              index={index}
              item={item}
            />
          ))}
        </Accordion>
      </Stack>
    </SectionBase>
  );
};

const FAQItem = ({
  item,
  index,
}: {
  item: { title: string; description: string };
  index: number;
}) => (
  <AccordionItem
    /* Aynı başlık iki kez geçebilir; index ile benzersizleştiriliyor. */
    value={`${item.title}-${index}`}
    className="border-b border-gray-200"
    triggerClassName="py-3.5 sm:py-[18px]"
    contentClassName="pb-4 sm:pb-5"
    hideChevron
    trigger={
      <>
        <Typography variant="warningSemibold" as="span" className="pr-4 font-semibold leading-[1.35]">
          {item.title}
        </Typography>
        {/* MUI'de `expandIcon` açık/kapalı ikonu değiştiriyordu; Radix'te
            aynı etki `data-[state]` ile — JS'siz. */}
        <span className="shrink-0 text-text">
          <Plus size={20} className="group-data-[state=open]:hidden" />
          <Minus size={20} className="hidden group-data-[state=open]:block" />
        </span>
      </>
    }
  >
    <Markdown text={item.description} options={{ p: { variant: 'warning', fontWeight: 400 } }} />
  </AccordionItem>
);

export default FAQ;
