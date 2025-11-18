import Card from '@/components/common/Card';
import Link from '@/components/common/Link';
import Icon from '@/components/Icon';
import { ShopSearchOptions } from '@/lib/api/types';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { Stack, Typography } from '@mui/material';
import Image from 'next/image';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';
import useStyles from './styles';
import { usePathname } from 'next/navigation';

export interface ShopFeatureCardProps {
  image: SharedImageType;
  variant: 'default' | 'compact';
  title?: string;
  description?: string;
  searchOptions?: ShopSearchOptions;
  url?: string;
}

const ShopFeatureCard = ({
  image,
  variant = 'default',
  title,
  description,
  searchOptions,
  url,
}: ShopFeatureCardProps) => {
  const styles = useStyles()(variant);
  // TODO: Remove after 11.11
  const pathname = usePathname();
  const shouldUseFrame =
    variant === 'default' &&
    (pathname === '' ||
      pathname === '/men' ||
      pathname === '/home-appliances' ||
      pathname === '/shoes' ||
      pathname === '/mom-child');

  return (
    <Link href={searchOptions ? searchUrlFromOptions({ ...searchOptions, nt: true }) : url}>
      <Card sx={{ ...styles.card, mt: shouldUseFrame ? 1 : 0 }} border={variant === 'compact'}>
        <Stack sx={styles.cardBody}>
          {shouldUseFrame && (
            <Stack
              sx={{
                position: 'absolute',
                top: -4,
                left: 0,
                right: 0,
                bottom: title || description ? 0 : -4,
                borderRadius: 1.2,
                overflow: 'hidden',
              }}
            >
              <Image src="/static/images/frame.png" fill alt="" />
            </Stack>
          )}
          {image?.data ? (
            <Stack
              sx={{ ...styles.imageContainer, transform: shouldUseFrame ? 'scale(0.9)' : 'none' }}
            >
              <CMSImage
                src={image.data.attributes.url}
                alt={image.data.attributes.alternativeText}
                fill
                style={styles.image}
              />
            </Stack>
          ) : (
            <div />
          )}
          {(title || description) && (
            <Stack sx={styles.textContainer}>
              <Stack>
                <Typography variant="warningSemibold" sx={styles.title}>
                  {title}
                </Typography>
                <Typography variant="warningSemibold" sx={styles.description}>
                  {description}
                </Typography>
              </Stack>
              <Icon name="chevron_right" fontSize={20} />
            </Stack>
          )}
        </Stack>
      </Card>
    </Link>
  );
};

export default ShopFeatureCard;
