import InfoItem from '@/components/InfoItem';
import { ShopProductAttribute } from '@/lib/api/types';
import { Grid, Stack } from '@mui/material';
import useStyles from './styles';

const ProductAttributes = ({ attributes }: { attributes: ShopProductAttribute[] }) => {
  const styles = useStyles();
  return (
    <Stack gap={2}>
      <Grid container spacing={1}>
        {attributes.map((e) => (
          <Grid item xs={6} md={4} key={e.name + e.value}>
            <InfoItem
              label={e.name}
              value={e.value}
              slotProps={{
                label: { variant: 'caption', fontWeight: 500, lineHeight: 'normal' },
                value: { variant: 'cardTitle', fontWeight: 600, lineHeight: 'normal' },
              }}
              sx={styles.attribute}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default ProductAttributes;
