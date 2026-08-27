'use client';

import Link from '@/components/common/Link';
import { Box, Stack, Typography } from '@mui/material';
import CMSImage from '../../shared/CMSImage';
import { SharedImageType } from '../../shared/cmsTypes';
import { SectionBaseProps } from '../SectionBase';
import styles from './styles';

export interface ShopPromoCardProps {
  section?: SectionBaseProps;
  image: SharedImageType;
  title: string;
  description?: string;
  /** Başlığın üstündeki küçük etiket (GÜNDÜZ / GECE gibi). CMS'te yoksa basılmaz. */
  label?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

const ShopPromoCard = ({ image, title, description, label, buttonLabel, buttonHref }: ShopPromoCardProps) => (
  <Link href={buttonHref} style={styles.link}>
    <Box sx={styles.card}>
      <CMSImage
        src={image?.data?.attributes?.url}
        alt={image?.data?.attributes?.alternativeText || title}
        fill
        sizes="(min-width:900px) 50vw, 100vw"
        style={{ objectFit: 'cover' }}
      />
      <Stack sx={styles.overlay}>
        {label && <Typography sx={styles.label}>{label}</Typography>}
        <Typography sx={styles.title}>{title}</Typography>
        {description && <Typography sx={styles.description}>{description}</Typography>}
        {buttonLabel && <Typography sx={styles.cta}>{buttonLabel}</Typography>}
      </Stack>
    </Box>
  </Link>
);

export default ShopPromoCard;
