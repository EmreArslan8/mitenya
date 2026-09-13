'use client';

import Markdown from '@/components/common/Markdown';
import { ShopProductData } from '@/lib/api/types';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Typography } from '@/components/ui/Typography';
import { ArrowUpRight, Minus, Plus } from '@/components/icons';
import { openProductQA } from '../ProductShopAssistant/events';

type ProductFaqProps = {
  faqs?: ShopProductData['faqs'];
  productName?: string;
};

type ProductFaqItemProps = {
  answer: string;
  question: string;
};

function ProductFaqItem({ answer, question, index }: ProductFaqItemProps & { index: number }) {
  return (
    /*
     * ADR-0002 Faz 2: MUI Accordion -> Radix.
     * Eski styles.ts karşılıkları:
     *   item     borderBottom #E8E1DF (palette'te yok, ESKİDEN DE hard-coded)
     *   summary  py {xs:1.5, sm:1.7} -> py-3 sm:py-[13.6px]
     *   question fontSize {xs:17, sm:18}
     *   details  pb {xs:1.8, sm:2} -> pb-[14.4px] sm:pb-4
     *   answer   14px / 1.75 / text.secondary
     */
    <AccordionItem
      /* Aynı soru iki kez geçerse Radix aynı value'yu paylaşır ve ikisi
         birlikte açılır — index ile ayrıştırılıyor (review bulgusu). */
      value={`${question}-${index}`}
      className="overflow-hidden border-b border-[#E8E1DF]"
      triggerClassName="py-3 sm:py-[13.6px]"
      contentClassName="pb-[14.4px] sm:pb-4"
      hideChevron
      trigger={
        <>
          <Typography as="h3" className="text-[17px] sm:text-[18px]">
            {question}
          </Typography>
          <span className="shrink-0">
            <Plus size={16} className="group-data-[state=open]:hidden" />
            <Minus size={16} className="hidden group-data-[state=open]:block" />
          </span>
        </>
      }
    >
      {/* Sınıflar sarmalayıcıda — HtmlContent'in Emotion `& p` kuralı
          doğrudan verilen sınıfları ezerdi (konvansiyon.md §6). */}
      {/* `!`: Emotion'ın `& p { fontSize:14, lineHeight:1.6 }` kuralı
          katmansız ve Tailwind'i yener (konvansiyon.md §6). */}
      <div className="max-w-[720px] [&_p]:!text-[14px] [&_p]:!leading-[1.75] [&_p]:text-text-secondary sm:pr-6">
        <Markdown text={answer} />
      </div>
    </AccordionItem>
  );
}

export default function ProductFaq({ faqs, productName }: ProductFaqProps) {
  if (!faqs?.length) return null;

  return (
    <section className="mt-0 flex flex-col gap-4 px-4 sm:px-8">
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.4fr)] md:gap-8">
        <div className="flex flex-col gap-[9px] md:pr-4">
          <Typography
            variant="h2"
            as="h2"
            className="text-[24px] font-medium leading-[28px] sm:text-[36px] sm:leading-[40px]"
          >
            Sıkça Sorulan
            <br />
            Sorular
          </Typography>
          <Typography className="max-w-[320px] text-[13px] leading-[1.6] text-text-secondary">
            {productName
              ? `${productName} hakkinda en cok merak edilen detaylari burada bulabilirsiniz.`
              : 'Urun hakkinda en cok merak edilen detaylari burada bulabilirsiniz.'}
          </Typography>
        </div>

        <div className="flex flex-col gap-[11px]">
          {/* AccordionItem'lar Radix Root'u içinde olmak zorunda. */}
          <Accordion>
            {faqs.map((faq, index) => (
              <ProductFaqItem
                key={`${faq.question}-${index}`}
                index={index}
                answer={faq.answer}
                question={faq.question}
              />
            ))}
          </Accordion>

          <button
            type="button"
            onClick={openProductQA}
            className="mt-2 inline-flex cursor-pointer appearance-none items-center gap-1 self-start border-0 bg-transparent p-0 text-text"
          >
            {/* MUI 'text.primary' = rgba(0,0,0,.87); palette.ts'te bu anahtar yok */}
            <Typography
              as="span"
              className="text-[14px] font-semibold leading-[1.4] text-black/[87%] underline underline-offset-[3px]"
            >
              Cevabını bulamadın mı? Ürün hakkında yapay zekaya sor
            </Typography>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
