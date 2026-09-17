import { ChevronDown, Sparkles } from '@/components/icons';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';

/**
 * Öne çıkan faydalar — ADR-0002 Faz 2'de MUI Accordion'dan Radix'e taşındı.
 *
 * `'use client'` KALKTI: açık/kapalı durumu artık Radix'te ve varsayılan açık
 * olması `defaultValue` ile veriliyor — bu dosyada başka etkileşim yok, yani
 * artık SERVER COMPONENT.
 *
 * Eski `withPalette` stillerinin karşılıkları (konvansiyon.md §1/§3):
 *   accordion  borderTop gray[100] + pt 12px
 *   titleRow   flex-row, gap 6px, py 2px
 *   title      13px / 800 / ls 0.07em / uppercase / primary / lh 1
 *   chevron    primary, opacity 0.7
 *   details    pt 12px
 *   grid       tek sütun, gap 10px · item flex-row gap 10px
 *   emoji      15px / lh 1 / shrink-0 · text 14px / 1.45 / 500 / text.main
 */

type BenefitItem = { icon?: string; text: string };

const ProductBenefits = ({
  benefits,
  title = 'Öne Çıkan Faydalar',
}: {
  benefits: BenefitItem[];
  title?: string;
}) => {
  if (!benefits.length) return null;

  return (
    <Accordion defaultValue={['benefits']}>
      <AccordionItem
        value="benefits"
        className="border-t border-gray-100 pt-3"
        contentClassName="pt-3"
        hideChevron
        trigger={
          <>
            <span className="flex flex-row items-center gap-1.5 py-0.5">
              <span className="flex items-center text-primary opacity-85">
                <Sparkles size={13} strokeWidth={2.5} />
              </span>
              <Typography
                as="span"
                className="text-[13px] font-extrabold uppercase leading-none tracking-[0.07em] text-primary"
              >
                {title}
              </Typography>
            </span>
            <ChevronDown
              size={15}
              strokeWidth={2.5}
              className="shrink-0 text-primary opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </>
        }
      >
        <div className="grid grid-cols-1 gap-2.5">
          {benefits.map((benefit) => (
            <Stack key={benefit.text} direction="row" align="center" className="gap-2.5">
              {benefit.icon ? (
                <Typography as="span" className="shrink-0 text-[15px] leading-none">
                  {benefit.icon}
                </Typography>
              ) : null}
              <Typography as="span" className="text-[14px] font-medium leading-[1.45] text-text">
                {benefit.text}
              </Typography>
            </Stack>
          ))}
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductBenefits;
