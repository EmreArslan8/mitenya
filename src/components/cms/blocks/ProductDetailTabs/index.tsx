import Button from '@/components/ui/Button';
import Markdown from '@/components/common/Markdown';
import CMSImage from '@/components/cms/shared/CMSImage';
import { SharedImageType } from '@/components/cms/shared/cmsTypes';
import SectionBase, { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import type { BlockComponentBaseProps } from '..';

export interface ProductDetailTabsProps extends BlockComponentBaseProps {
  section?: SectionBaseProps;
  image: SharedImageType;
  items: {
    title: string;
    description?: string;
  }[];
}

const ProductDetailTabs = ({ section, image, items }: ProductDetailTabsProps) => {
  if (!items.length || !image?.data?.attributes?.url) return null;

  const {
    sectionHeader,
    sectionDescription,
    sectionDescriptionMarkdownOptions,
    sectionLabel,
    sectionHref,
    className: sectionClassName,
    ...sectionBaseProps
  } = section ?? {};

  return (
    <SectionBase {...sectionBaseProps} className={`mt-6 max-w-full px-4 py-4 sm:px-8 sm:py-6 md:mt-10 md:py-8 ${sectionClassName ?? ''}`}>
      {(sectionHeader || sectionDescription || sectionLabel) && (
        <Stack gap={1}>
          {(sectionHeader || sectionLabel) && (
            <Stack direction="row" align="center" justify="between" gap={1}>
              <div className="min-w-0 flex-1">
                {sectionHeader ? (
                  <Typography
                    as="h2"
                    className="m-0 text-[24px] font-medium leading-[28px] text-gray-900 sm:text-[36px] sm:leading-[40px]"
                  >
                    {sectionHeader}
                  </Typography>
                ) : null}
              </div>
              {sectionLabel ? (
                <Button
                  color="neutral"
                  arrow="end"
                  size="small"
                  variant="outlined"
                  className="min-h-7 rounded-lg border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold leading-none tracking-[0.02em] text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                  href={sectionHref}
                >
                  {sectionLabel}
                </Button>
              ) : null}
            </Stack>
          )}
          {sectionDescription ? (
            <Markdown text={sectionDescription} options={sectionDescriptionMarkdownOptions} />
          ) : null}
        </Stack>
      )}
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_520px] md:gap-10">
        <Stack className="min-w-0 self-stretch justify-start">
          {/* Radix Root: ilk sekme açık başlıyor (eski `activeIndex=0` davranışı). */}
          {/* MUI'de tek `activeIndex` vardı: aynı anda tek bölüm açık. */}
          <Accordion type="single" defaultValue={[`${items[0]?.title}-0`]}>
          {items.map((item, index) => {
            return (
              <AccordionItem
                key={`${item.title}-${index}`}
                value={`${item.title}-${index}`}
                className="border-b border-gray-100 first:border-t"
                triggerClassName="py-[18px] md:py-[20.8px]"
                contentClassName="pb-[18px] md:pb-[20.8px]"
                trigger={
                  <Typography className="text-[18px] font-semibold leading-[1.35] text-text">
                    {item.title}
                  </Typography>
                }
              >
                {/* Sınıflar SARMALAYICIDA: HtmlContent hâlâ MUI Box, Emotion
                    katmansız yazıyor ve `& p` kuralı Tailwind'i ezer
                    (konvansiyon.md §6). Doğrudan Markdown'a verilirse
                    fontSize 14'te kalırdı — review'de yakalandı. */}
                {/*
                  `!` ZORUNLU: HtmlContent'in Emotion kuralı (`& p { fontSize:14,
                  lineHeight:1.6 }`) KATMANSIZ yazılıyor ve `@layer utilities`
                  içindeki Tailwind'i her koşulda yener (konvansiyon.md §6).
                  Sarmalayıcıya taşımak yetmiyor — Emotion'ın SET ETTİĞİ
                  özellikler için `!` şart. `color`u Emotion set etmediği için
                  orada `!` gereksiz ama zararsız; asıl gereken font-size ve
                  line-height'taydı (review bulgusu).
                */}
                <div className="max-w-[620px] [&_p]:!mb-0 [&_p]:!text-[13.5px] [&_p]:!leading-[1.62] [&_p]:text-gray-400 md:[&_p]:!text-[15px]">
                  {item.description ? <Markdown text={item.description} /> : null}
                </div>
              </AccordionItem>
            );
          })}
          </Accordion>
        </Stack>

        <div className="hidden min-w-0 self-stretch md:block">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[rgb(235,235,232)]">
            <CMSImage
              src={image.data.attributes.url}
              alt={image.data.attributes.alternativeText || items[0]?.title || 'Product detail visual'}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </SectionBase>
  );
}
export default ProductDetailTabs;
