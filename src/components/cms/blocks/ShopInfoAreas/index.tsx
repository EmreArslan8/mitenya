'use client';

import useScreen from '@/lib/hooks/useScreen';
import { Box, Grid } from '@mui/material';
import { BlockComponentBaseProps } from '..';
import InfoArea from '../../shared/InfoArea';
import { SharedImageType } from '../../shared/cmsTypes';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import styles from './styles';

export interface InfoAreasProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  infoAreas: { label?: string; description: string; url?: string; icon?: SharedImageType }[];
}

const ShopInfoAreas = ({ section, infoAreas }: InfoAreasProps) => {
  const { mdDown } = useScreen();

  return (
    <SectionBase
      {...section}
      sx={{
        mb: { xs: -3.5, md: -6 },
        mt: { xs: -4, sm: -4, md: -3 },
      }}
    >
      <Box sx={styles.wrapper}>
        {mdDown ? (
          <Box sx={styles.mobileContainer}>
            {infoAreas.map((infoArea, index) => (
              <Box key={index} sx={styles.mobileItem}>
                <InfoArea {...infoArea} index={index} />
              </Box>
            ))}
          </Box>
        ) : (
          <Grid container spacing={2} justifyContent="space-around" alignItems="center">
            {infoAreas.map((infoArea, index) => (
              <Grid
              item
                key={`${infoArea.label ?? 'info'}-${index}`}
                xs={12}
                sm={Math.max(3, 12 / infoAreas.length)}
                sx={{ display: 'flex', justifyContent: 'center', }}
              >
                <InfoArea {...infoArea} index={index} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </SectionBase>
  );
};

export default ShopInfoAreas;
