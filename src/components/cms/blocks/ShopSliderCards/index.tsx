// src/components/blocks/HorizontalMediaSlider/index.tsx

import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import CustomSlider from '@/components/CustomSlider';
import useStyles from './styles'; // NOT: styles.ts'yi uygun klasörden çektiğinizden emin olun
import { Box, Stack, Typography } from '@mui/material';
import { Settings as ReactSlickSliderSettings } from 'react-slick';
import { SharedImageType } from '../../shared/cmsTypes';
import ShopSliderCard from '../../shared/ShopSliderCard'; 
import { BlockComponentBaseProps } from '..';


export interface ShopSliderCardsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  cards: { image: SharedImageType; label?: string; url: string ; title?: string }[];
}


const ShopSliderCards = ({ section, cards }: ShopSliderCardsProps) => {
  const styles = useStyles();
  
  if (!cards || cards.length === 0) return null;

  // Slayt ayarları (Geniş kartlar için 5 idealdir)
  const sliderSettings: ReactSlickSliderSettings = {
    infinite: false,
    slidesToShow: 4.5, // Resimdeki gibi son kartın yarısını göstermek için
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 900, settings: { slidesToShow: 3.2 } }, // Tablet için
      { breakpoint: 600, settings: { slidesToShow: 2.2, showControls: false } as ReactSlickSliderSettings}, // sm
      { breakpoint: 480, settings: { slidesToShow: 1.2, showControls: false } as ReactSlickSliderSettings}, // xs
    ],
  };

  return (
    <SectionBase {...section}>
      <Stack spacing={2}>
        {/* Başlık: Görseldeki "Popüler Kategoriler" metni */}
        <Typography variant="h6" fontWeight={600} sx={{ px: { xs: 2, sm: 0 } }}>
           { 'Popüler Kategoriler'} 
        </Typography>

        <Box>
          <CustomSlider {...sliderSettings}>
            {cards.map((e) => (
              <Box key={e.url} sx={styles.slideWrapper}> {/* styles.ts'deki boşluk stilini kullanır */}
                <ShopSliderCard
                  image={e.image}
                  url={e.url}
                  title={e.title}
                  label={e.label} 
                />
              </Box>
            ))}
          </CustomSlider>
        </Box>
      </Stack>
    </SectionBase>
  );
};

export default ShopSliderCards;