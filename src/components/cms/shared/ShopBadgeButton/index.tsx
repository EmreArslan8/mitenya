import Link from '@/components/common/Link';
import useScreen from '@/lib/hooks/useScreen';
import { Stack, Typography } from '@mui/material';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';
import useStyles from './styles';

export interface ShopBadgeButtonProps {
  image: SharedImageType;
  url?: string | null;
  label?: string | null;
}

const ShopBadgeButton = ({ url, image, label }: ShopBadgeButtonProps) => {
  const styles = useStyles();
  const { smDown } = useScreen();

  if (!image) return null;

  return (
    <Stack sx={styles.cardContainer}>
      <Link href={url}>
        <CMSImage
          src={image.data.attributes.url}
          alt={image.data.attributes.alternativeText}
          width={smDown ? 56 : 80}
          height={smDown ? 56 : 80}
          style={{ objectFit: 'contain', borderRadius: '8px' }}
        />
      </Link>
      {label && (
        <Typography variant="caption" sx={styles.label}>
          {label}
        </Typography>
      )}
    </Stack>
  );
};

export default ShopBadgeButton;
