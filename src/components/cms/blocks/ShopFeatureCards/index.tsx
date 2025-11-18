import { ShopSearchOptions } from '@/lib/api/types';
import { Grid } from '@mui/material';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import ShopFeatureCard from '../../shared/ShopFeatureCard';
import { GridOptions, SharedImageType } from '../../shared/cmsTypes';

const defaultGridOptions: GridOptions = { xs: 6, sm: 6, md: 4, lg: 3 };

export interface ShopFeatureCardsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  variant: 'default' | 'compact';
  cards: { image: SharedImageType; title: string; searchOptions: ShopSearchOptions }[];
  gridOptions: GridOptions;
}

const ShopFeatureCards = ({
  section,
  variant: _variant,
  cards,
  gridOptions: _gridOptions,
}: ShopFeatureCardsProps) => {
  const gridOptions = _gridOptions ?? defaultGridOptions;
  const variant = _variant ?? 'default';

  return (
    <SectionBase {...section} sx={{ gap: 2 }}>
      <Grid container columnSpacing={{ xs: 1, sm: 2 }} rowSpacing={{ xs: 1, sm: 2.5 }}>
        {cards.map((item) => (
          <Grid item {...gridOptions} key={item.title}>
            <ShopFeatureCard variant={variant} {...item} />
          </Grid>
        ))}
      </Grid>
    </SectionBase>
  );
};

export default ShopFeatureCards;
