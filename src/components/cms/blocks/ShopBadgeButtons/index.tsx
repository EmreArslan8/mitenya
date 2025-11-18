import { Grid, Stack } from '@mui/material';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedImageType } from '../../shared/cmsTypes';

import ShopBadgeButton from '../../shared/ShopBadgeButton';
export interface ShopBadgeButtonsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  badges: { image: SharedImageType; label?: string; url: string }[];
}

const ShopBadgeButtons = ({ section, badges }: ShopBadgeButtonsProps) => {
  const getGridSize = () => {
    switch (badges.length) {
      case 1:
        return { xs: 3, sm: 12 };
      case 2:
        return { xs: 3, sm: 6 };
      case 3:
        return { xs: 3, sm: 4 };
      case 4:
        return { xs: 3, sm: 3 };
      case 5:
        return { xs: 3, sm: 2.4 };
      case 6:
        return { xs: 3, sm: 4 };
      default:
        return { xs: 3, sm: 3 };
    }
  };

  return (
    <SectionBase {...section} sx={{ ...section?.sx, mb: { xs: -4, sm: -6 } }}>
      <Grid container spacing={2}>
        {badges.map((e) => (
          <Grid {...getGridSize()} item key={e.url}>
            <Stack alignItems="center">
              <ShopBadgeButton image={e.image} label={e.label} url={e.url} />
            </Stack>
          </Grid>
        ))}
      </Grid>
    </SectionBase>
  );
};

export default ShopBadgeButtons;
