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
        pt: 0,
        pb: 0,
        mt: { xs: -3, md: -7 },
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
          <Grid container spacing={0} alignItems="stretch" sx={{ py: 0 }}>
            {infoAreas.map((infoArea, index) => (
              <Grid
                item
                key={`${infoArea.label ?? 'info'}-${index}`}
                xs={12}
                sm={Math.max(3, 12 / infoAreas.length)}
                sx={styles.desktopItem}
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
