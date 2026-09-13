import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopPromoCard, { ShopPromoCardProps } from '../../shared/ShopPromoCard';

export interface ShopPromoCardsProps extends BlockComponentBaseProps {
  cards: ShopPromoCardProps[];
  section: SectionBaseProps;
}

const ShopPromoCards = ({ cards = [], section }: ShopPromoCardsProps) => (
  <SectionBase {...section}>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      {cards.slice(0, 2).map((card, index) => <ShopPromoCard {...card} key={card?.title ?? index} />)}
    </div>
  </SectionBase>
);

export default ShopPromoCards;
