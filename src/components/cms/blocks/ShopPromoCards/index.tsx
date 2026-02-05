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
              descriptionColor="#d4c8e8"
              buttonBgColor="#F7EFFF"
              buttonTextColor="#4B3665"
            />
          </Grid>
        )}

        {rightCard && (
          <Grid item xs={12} sm={6}>
            <ShopPromoCard
              {...rightCard}
              titleColor="#a7a098"
              descriptionColor="#2E2520"
              buttonBgColor="#FFEAC0"
              buttonTextColor="#4A3A24"
            />
          </Grid>
        )}
      </Grid>
    </SectionBase>
  );
};


export default ShopPromoCards;
