import { Grid, Stack, Box } from '@mui/material';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedImageType } from '../../shared/cmsTypes';
import ShopBadgeButton from '../../shared/ShopBadgeButton';

export interface ShopBadgeButtonsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  badges: {
    image: SharedImageType;
    label?: string;
    url: string;
    title?: string;
  }[];
}

const ShopBadgeButtons = ({ section, badges }: ShopBadgeButtonsProps) => {
  const getGridSize = () => {
    switch (badges.length) {
      case 1:
        return { sm: 12 };
      case 2:
        return { sm: 6 };
      case 3:
        return { sm: 4 };
      case 4:
        return { sm: 3 };
      case 5:
        return { sm: 2.4, md: 2 };
      case 6:
        return { sm: 4, md: 2 };
      case 8:
        return { sm: 2, md: 1.5 };
      default:
        return { sm: 3 };
    }
  };

  return (
    <SectionBase {...section} sx={{ ...section?.sx, mb: { xs: -4, sm: -6 } }}>
      {/* ✅ MOBILE – Horizontal scroll */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          overflowX: 'auto',
          gap: 2,
          px: 1,
          pb: 1,
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {badges.map((e) => (
          <Box
            key={e.url}
            sx={{
              flex: '0 0 auto',
              scrollSnapAlign: 'start',
            }}
          >
            <ShopBadgeButton
              image={e.image}
              label={e.label}
              url={e.url}
              title={e.title}
            />
          </Box>
        ))}
      </Box>

      {/* ✅ TABLET + DESKTOP – Grid */}
      <Grid container spacing={2} sx={{ display: { xs: 'none', sm: 'flex' } }}>
        {badges.map((e) => (
          <Grid item {...getGridSize()} key={e.url}>
            <Stack alignItems="center">
              <ShopBadgeButton
                image={e.image}
                label={e.label}
                url={e.url}
                title={e.title}
              />
            </Stack>
          </Grid>
        ))}
      </Grid>
    </SectionBase>
  );
};

export default ShopBadgeButtons;
