import { Box, Stack, Typography } from '@mui/material';
import CMSImage from '../../shared/CMSImage';
import { SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';
import { SectionBaseProps } from '../SectionBase';
import Button from '@/components/common/Button';

export interface ShopPromoCardProps {
  section?: SectionBaseProps;
  image: SharedImageType;
  title: string;
  ctaText?: string;
  ctaUrl?: string;
  colorway: 'light' | 'dark'; // CMS’ten gelir
}

const ShopPromoCard = ({
  image,
  title,
  ctaText,
  ctaUrl,
  colorway,
}: ShopPromoCardProps) => {
  const styles = useStyles()(colorway);

  return (
    <Box sx={styles.container}>
      <CMSImage
        src={image?.data?.attributes?.url}
        alt={title}
        fill
        style={styles.image}
      />

      <Stack sx={styles.content}>
        <Typography sx={styles.title}>
          {title}
        </Typography>

        {ctaText && ctaUrl && (
          <Button
            href={ctaUrl}
            sx={styles.button}
            size="small"
          >
            {ctaText}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default ShopPromoCard;
