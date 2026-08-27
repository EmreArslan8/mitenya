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
  target?: '_self' | '_blank';
  index?: number;
  variant?: 'default' | 'featured';
}

const ShopCategoryBlock = ({
  image,
  title,
  label,
  href,
  buttonLabel,
  target = '_self',
  index = 0,
}: ShopCategoryBlockProps) => {
  const styles = useStyles();

  return (
    <Link
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      style={styles.link}
    >
      <Card sx={styles.card}>
        <Stack sx={styles.cardBody}>
          {image?.data && (
            <Stack sx={styles.imageContainer}>
              <CMSImage
                src={image.data.attributes.url}
                alt={image.data.attributes.alternativeText || title}
                fill
                sizes="(min-width:1200px) 20vw, (min-width:600px) 50vw, 82vw"
                style={styles.image}
              />
            </Stack>
          )}

          <Typography sx={styles.index}>{String(index + 1).padStart(2, '0')}</Typography>

          <Stack sx={styles.content}>
            <Typography sx={styles.title}>{title}</Typography>
            {label && (
              <Typography sx={styles.description}>{label}</Typography>
            )}
            <Stack sx={styles.actionRow}>
              <Typography sx={styles.action}>{buttonLabel || 'Ürünleri keşfet'}</Typography>
              <Typography aria-hidden="true" className="category-arrow" sx={styles.arrow}>↗</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Link>
  );
};

export default ShopCategoryBlock;
