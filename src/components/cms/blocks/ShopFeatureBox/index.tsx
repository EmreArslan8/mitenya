'use client';

import { Grid, Stack, Typography } from '@mui/material';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';
import CMSImage from '../../shared/CMSImage';
import Markdown from '@/components/common/Markdown';
import Button from '@/components/common/Button';


export interface ShopFeatureBoxProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  title?: string;
  description?: string;
  image: SharedImageType;
  imagePosition: 'start' | 'end';
  imageFit: 'cover' | 'contain';
  button?: any;
}

const ShopFeatureBox = ({
  section,
  title,
  description,
  image,
  imagePosition,
  imageFit,
  button,
}: ShopFeatureBoxProps) => {
  const styles = useStyles();

  return (
    <SectionBase {...section}>
      <Grid container spacing={{ xs: 3, sm: 4 }}>
        <Grid item xs={12} sm={6} order={{ sm: imagePosition === 'start' ? 0 : 1 }}>
          <Stack sx={styles.imageContainer}>
            <CMSImage
              src={image.data.attributes.url}
              alt={image.data.attributes.alternativeText}
              fill
              style={styles.image(imageFit)}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack sx={styles.text}>
            {title && <Typography variant="h2">{title}</Typography>}
            {description && <Markdown text={description} />}
            {button && (
              <Button size="small" {...button} sx={{ mt: 2 }} variant="tonal">
                {button.label}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </SectionBase>
  );
};

export default ShopFeatureBox;
