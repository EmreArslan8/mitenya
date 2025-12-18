import { Grid } from '@mui/material';
import { BlockComponentBaseProps } from '..';

import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopPromoCard from '../../shared/ShopPromoCard';

export interface ShopPromoCardsProps extends BlockComponentBaseProps {
  cards: any[];
  section: SectionBaseProps;
}

const ShopPromoCards = ({ cards = [], section }: ShopPromoCardsProps) => {
  const leftCard = cards[0];
  const rightCard = cards[1];

  return (
    <SectionBase {...section}>
      <Grid container spacing={2}>
        {leftCard && (
          <Grid item xs={12} md={6}>
            <ShopPromoCard {...leftCard} />
          </Grid>
        )}

        {rightCard && (
          <Grid item xs={12} md={6}>
            <ShopPromoCard {...rightCard} />
          </Grid>
        )}
      </Grid>
    </SectionBase>
  );
};


export default ShopPromoCards;
