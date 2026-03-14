'use client';

import CMSImage from '@/components/cms/shared/CMSImage';
import { SharedImageType } from '@/components/cms/shared/cmsTypes';
import SectionBase, { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { Box, Stack, Typography } from '@mui/material';
import type { BlockComponentBaseProps } from '..';
import useStyles from './styles';

export interface ProductDetailIngredientsProps extends BlockComponentBaseProps {
  section?: SectionBaseProps;
  items: {
    eyebrow?: string;
    title: string;
    description?: string;
    image: SharedImageType;
  }[];
}

const ProductDetailIngredients = ({ section, items }: ProductDetailIngredientsProps) => {
  const styles = useStyles();
  const validItems = items.filter((item) => item.image?.data?.attributes?.url);

  if (!validItems.length) return null;

  return (
    <SectionBase {...(section ?? {})} sx={styles.section}>
      <Box sx={styles.grid}>
        {validItems.map((item, index) => (
          <Box key={`${item.title}-${index}`} sx={styles.card}>
            <Box sx={styles.mediaWrap}>
              <CMSImage
                src={item.image.data.attributes.url}
                alt={item.image.data.attributes.alternativeText || item.title}
                fill
                style={styles.image}
              />
              <Box sx={styles.overlay} />
            </Box>

            <Stack sx={styles.body}>
              {item.eyebrow ? <Typography sx={styles.eyebrow}>{item.eyebrow}</Typography> : null}
              <Typography sx={styles.title}>{item.title}</Typography>
              {item.description ? <Typography sx={styles.description}>{item.description}</Typography> : null}
            </Stack>
          </Box>
        ))}
      </Box>
    </SectionBase>
  );
}

export default ProductDetailIngredients;