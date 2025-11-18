import useScreen from '@/lib/hooks/useScreen';
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import InfoArea from '../../shared/InfoArea';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import styles from './styles';

export interface InfoAreasProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  infoAreas: { icon: string; label?: string; description: string; url?: string }[];
}

const ShopInfoAreas = ({ section, infoAreas }: InfoAreasProps) => {
  const { smDown } = useScreen();
  const [currentInfoAreaIndex, setCurrentInfoAreaIndex] = useState(0);

  useEffect(() => {
    if (smDown) {
      const interval = setInterval(() => {
        setCurrentInfoAreaIndex((prevIndex) => (prevIndex + 1) % infoAreas.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [infoAreas.length, smDown]);

  return (
    <SectionBase {...section} sx={{ mb: { xs: -3.5, md: -6 } }}>
      <Grid container spacing={2} justifyContent="space-around" alignItems="center">
        {infoAreas.map((infoArea, index) => (
          <Grid
            item
            xs={12}
            sm={Math.max(4, 12 / infoAreas.length)}
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={
              smDown
                ? index === currentInfoAreaIndex
                  ? styles.content
                  : styles.hiddenContent
                : styles.visibleContent
            }
            key={infoArea.label}
          >
            <InfoArea {...infoArea} />
          </Grid>
        ))}
      </Grid>
    </SectionBase>
  );
};

export default ShopInfoAreas;
