import { Grid } from '@mui/material';
import { BlockComponentBaseProps } from '..';

import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopPromoCard, { ShopPromoCardProps } from '../../shared/ShopPromoCard';

export interface ShopPromoCardsProps extends BlockComponentBaseProps {
  cards: ShopPromoCardProps[];
  section: SectionBaseProps;
}

const ShopPromoCards = ({ cards = [], section }: ShopPromoCardsProps) => (
  <SectionBase {...section}>
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {cards.slice(0, 2).map((card, index) => (
        <Grid item xs={12} md={6} key={card?.title ?? index}>
          <ShopPromoCard {...card} />
        </Grid>
      ))}
    </Grid>
  </SectionBase>
);

export default ShopPromoCards;
