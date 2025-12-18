import Card from '@/components/common/Card';
import Link from '@/components/common/Link';
import { Stack, Typography } from '@mui/material';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';
import useStyles from './styles';

export interface ShopCategoryBlockProps {
  image: SharedImageType;
  title: string;
  label?: string;
  href: string;
  buttonLabel?: string;
  variant?: 'default' | 'featured';
}

const ShopCategoryBlock = ({
  image,
  title,
  label,
  href,
  buttonLabel,
  variant = 'default',
}: ShopCategoryBlockProps) => {
  const styles = useStyles({ variant });

  return (
    <Link href={href}>
      <Card sx={styles.card}>
        <Stack sx={styles.cardBody}>
          {image?.data && (
            <Stack sx={styles.imageContainer}>
              <CMSImage
                src={image.data.attributes.url}
                alt={image.data.attributes.alternativeText || title}
                fill
                style={styles.image}
              />
            </Stack>
          )}

          <Stack sx={styles.textContainer}>
            {label && (
              <Typography sx={styles.label}>{label}</Typography>
            )}

            <Typography sx={styles.title}>{title}</Typography>

            {buttonLabel && (
              <Typography variant="body2" sx={styles.buttonLabel}>
                {buttonLabel}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Card>
    </Link>
  );
};

export default ShopCategoryBlock;
