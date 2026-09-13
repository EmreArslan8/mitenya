import { cn } from '@/lib/utils/cn';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopCategoryBlock from '../../shared/ShopCategoryBlock';
import { SharedImageType } from '../../shared/cmsTypes';

interface CategoryCard {
  image: SharedImageType;
  title: string;
  label?: string;
  href: string;
  buttonLabel?: string;
  target?: '_self' | '_blank';
  variant?: 'default' | 'featured';
}

export interface ShopCategoryBlocksProps extends BlockComponentBaseProps {
  section?: SectionBaseProps | null;
  cards?: CategoryCard[] | null;
}

const ShopCategoryBlocks = ({ section, cards }: ShopCategoryBlocksProps) => {
  const cardItems = cards ?? [];
  const sectionData: SectionBaseProps = section ?? { children: null };
  const sectionHeader = sectionData.sectionHeader || 'İhtiyacına göre';
  const sectionLabel = sectionData.sectionLabel || 'Cilt rehberi';
  const sectionDescription = sectionData.sectionDescription || 'Cildinin sana söylediğinden başla; bakımını ihtiyacına göre şekillendir.';
  if (!cardItems.length) return null;

  return (
    <SectionBase
      {...sectionData}
      sectionHeader={undefined}
      sectionDescription={undefined}
      sectionLabel={undefined}
      sectionHref={undefined}
      className={cn('gap-6 overflow-hidden border-y border-gray-100 bg-gray-50 px-4 py-8 sm:px-6 md:gap-9 md:px-8 md:py-12', sectionData.className)}
    >
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end md:gap-8">
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-bold uppercase leading-none tracking-[0.18em] text-error">{sectionLabel}</p>
          <h2 className="m-0 text-[30px] font-medium leading-none tracking-[-0.035em] text-text sm:text-4xl md:text-[44px]">{sectionHeader}</h2>
        </div>
        <p className="max-w-[440px] text-sm leading-[1.55] text-text-medium-light md:text-[15px]">{sectionDescription}</p>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
        {cardItems.map((item, index) => (
          <div key={`${item.title}-${index}`} className="h-full min-w-0 flex-[0_0_min(82vw,340px)] snap-start focus-within:outline focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-error sm:flex-initial">
            <ShopCategoryBlock {...item} index={index} variant={item.variant ?? 'default'} />
          </div>
        ))}
      </div>
    </SectionBase>
  );
};

export default ShopCategoryBlocks;
