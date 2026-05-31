'use client';

import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import CustomSlider from '@/components/CustomSlider';
import useStyles from './styles';
import { Box, Stack, Typography } from '@mui/material';
import { SharedImageType } from '../../shared/cmsTypes';
import ShopSliderCard from '../../shared/ShopSliderCard';
import { BlockComponentBaseProps } from '..';
import useScreen from '@/lib/hooks/useScreen';

export interface ShopSliderCardsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  cards: { image: SharedImageType; label?: string; url: string; title?: string }[];
}

const ShopSliderCards = ({ section, cards }: ShopSliderCardsProps) => {
  const styles = useStyles();
  const { smUp, mdUp, lgUp } = useScreen();

  if (!cards || cards.length === 0) return null;

  // Replaces slick responsive breakpoints
  const slidesToShow = lgUp ? 4.5 : mdUp ? 3.2 : smUp ? 2.2 : 1.2;
  const showControls = smUp;

  return (
    <SectionBase {...section}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600} sx={{ px: { xs: 2, sm: 0 } }}>
          Popüler Kategoriler
        </Typography>
        <Box>
          <CustomSlider slidesToShow={slidesToShow} slidesToScroll={1} infinite={false} showControls={showControls}>
            {cards.map((e) => (
              <Box key={e.url} sx={styles.slideWrapper}>
                <ShopSliderCard image={e.image} url={e.url} title={e.title} label={e.label} />
              </Box>
            ))}
          </CustomSlider>
        </Box>
      </Stack>
    </SectionBase>
  );
};

export default ShopSliderCards;
