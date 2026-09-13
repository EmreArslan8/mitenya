import { cn } from '@/lib/utils/cn';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedImageType } from '../../shared/cmsTypes';
import ShopBadgeButton from '../../shared/ShopBadgeButton';

export interface ShopBadgeButtonsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  badges: { image: SharedImageType; label?: string; url: string; title?: string }[];
}

const desktopGrid = (count: number) => count === 1 ? 'sm:grid-cols-1' : count === 2 ? 'sm:grid-cols-2' : count === 3 ? 'sm:grid-cols-3' : count === 5 ? 'sm:grid-cols-5 md:grid-cols-6' : count === 6 ? 'sm:grid-cols-3 md:grid-cols-6' : count === 8 ? 'sm:grid-cols-6 md:grid-cols-8' : 'sm:grid-cols-4';

const ShopBadgeButtons = ({ section, badges }: ShopBadgeButtonsProps) => (
  <SectionBase {...section} className={cn('-mb-8 sm:-mb-12', section.className)}>
    <div className="-mx-2 flex snap-x gap-4 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden">
      {badges.map((badge) => <div key={badge.url} className="shrink-0 snap-start"><ShopBadgeButton {...badge} /></div>)}
    </div>
    <div className={cn('hidden gap-4 sm:grid', desktopGrid(badges.length))}>
      {badges.map((badge) => <div key={badge.url} className="flex items-center justify-center"><ShopBadgeButton {...badge} /></div>)}
    </div>
  </SectionBase>
);

export default ShopBadgeButtons;
