import type { CSSProperties } from 'react';
import { ShopSearchOptions } from '@/lib/api/types';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopFeatureCard from '../../shared/ShopFeatureCard';
import { GridOptions, SharedImageType } from '../../shared/cmsTypes';

const defaultGridOptions: GridOptions = { xs: 6, sm: 6, md: 4, lg: 3 };
type GridStyle = CSSProperties & Record<`--grid-${string}`, number>;

export interface ShopFeatureCardsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  variant: 'default' | 'compact';
  cards: { image: SharedImageType; title: string; searchOptions: ShopSearchOptions }[];
  gridOptions: GridOptions;
}

const ShopFeatureCards = ({ section, variant = 'default', cards, gridOptions = defaultGridOptions }: ShopFeatureCardsProps) => (
  <SectionBase {...section} className="gap-4">
    <div className="grid grid-cols-12 gap-x-2 gap-y-2 sm:gap-x-4 sm:gap-y-5">
      {cards.map((item) => (
        <div
          key={item.title}
          style={{ '--grid-xs': gridOptions.xs, '--grid-sm': gridOptions.sm, '--grid-md': gridOptions.md, '--grid-lg': gridOptions.lg } as GridStyle}
          className="col-span-[var(--grid-xs)] sm:col-span-[var(--grid-sm)] md:col-span-[var(--grid-md)] lg:col-span-[var(--grid-lg)]"
        >
          <ShopFeatureCard variant={variant} {...item} />
        </div>
      ))}
    </div>
  </SectionBase>
);

export default ShopFeatureCards;
