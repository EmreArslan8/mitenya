'use client';

import { Box, Stack, Typography } from '@mui/material';
import CMSImage from '../../shared/CMSImage';
import { SharedImageType } from '../../shared/cmsTypes';
import { SectionBaseProps } from '../SectionBase';
import Button from '@/components/common/Button';
import styles from './styles';

export interface ShopPromoCardProps {
  section?: SectionBaseProps;
  image: SharedImageType;
  title: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

const ShopPromoCard = ({
  image,
  title,
  description,
  buttonLabel,
  buttonHref,
}: ShopPromoCardProps) => {


  return (
    <Box sx={styles.card}>
      <Box sx={styles.media}>
        <CMSImage
          src={image?.data?.attributes?.url}
          alt={title}
          fill
          style={{objectFit: "cover"}}
        />
      </Box>

      <Stack sx={styles.content}>
        <Typography sx={styles.title}>{title}</Typography>
          <Typography sx={styles.description}>{description}</Typography>
          <Button href={buttonHref} variant="text" size="small" sx={styles.cta}> {buttonLabel}</Button>
      </Stack>
    </Box>
  );
};

export default ShopPromoCard;