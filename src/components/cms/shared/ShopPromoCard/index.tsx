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
  titleColor?: string;
  descriptionColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
}

const ShopPromoCard = ({
  image,
  title,
  description,
  buttonLabel,
  buttonHref,
  titleColor = 'black',
  descriptionColor = 'black',
  buttonBgColor = 'transparent',
  buttonTextColor = 'black',
  buttonBorderColor,
}: ShopPromoCardProps) => {
  return (
    <Box sx={styles.card}>
      <Box sx={styles.media}>
        <CMSImage
          src={image?.data?.attributes?.url}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
        />
      </Box>

      <Stack sx={styles.content}>
        <Typography sx={{ ...styles.title, color: `${titleColor} !important` }}>{title}</Typography>
        <Typography sx={{ ...styles.description, color: `${descriptionColor} !important` }}>{description}</Typography>
        <Button
          href={buttonHref}
          variant="contained"
          disableElevation
          sx={{
            ...styles.cta,
            backgroundColor: `${buttonBgColor} !important`,
            color: `${buttonTextColor} !important`,
            ...(buttonBorderColor ? { border: `${buttonBorderColor} !important` } : {}),
            '&:hover': {
              backgroundColor: buttonBgColor,
              opacity: 0.9,
            }
          }}
        >
          {buttonLabel}
        </Button>
      </Stack>
    </Box>
  );
};

export default ShopPromoCard;
