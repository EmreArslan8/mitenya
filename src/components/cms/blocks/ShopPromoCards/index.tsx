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
          <Grid item xs={12} sm={6}>
            <ShopPromoCard
              {...leftCard}
              titleColor="white"
              descriptionColor="white"
              buttonBgColor="#1C2432"
              buttonTextColor="white"
            />
          </Grid>
        )}

        {rightCard && (
          <Grid item xs={12} sm={6}>
            <ShopPromoCard
              {...rightCard}
              titleColor="#8C6F5A"
              descriptionColor="#5A4639"
              buttonBgColor="#EDE1CC"
              buttonTextColor="#544338"
              buttonBorderColor="1px solid rgba(140, 111, 90, 0.16)"
            />
          </Grid>
        )}
      </Grid>
    </SectionBase>
  );
};


export default ShopPromoCards;
