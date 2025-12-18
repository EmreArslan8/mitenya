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
  title?: string | null; 
}


const ShopBadgeButton = ({ url, image, label, title }: ShopBadgeButtonProps) => {
  const styles = useStyles();
  const { smDown } = useScreen();

  if (!image) return null;

  return (
    <Stack alignItems="center" spacing={1}> 
      <Stack sx={styles.cardContainer}>
        <Link href={url}>
          <CMSImage
            src={image.data.attributes.url}
            alt={image.data.attributes.alternativeText}
            width={smDown ? 100 : 200}
            height={smDown ? 100 : 200}
            style={{ objectFit: 'contain', borderRadius: '99px' }}
          />
        </Link>
      </Stack>
      {title && (
        <Typography variant="body2" sx={styles.title}>
          {title}
        </Typography>
      )}
      {label && (
        <Typography variant="caption" sx={styles.label}>
          {label}
        </Typography>
      )}
    </Stack>
  );
};

export default ShopBadgeButton;