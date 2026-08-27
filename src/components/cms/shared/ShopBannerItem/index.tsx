import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import CMSImage from '../CMSImage';
import { SharedButtonType, SharedImageType } from '../cmsTypes';
import useStyles from './styles';

export interface ShopBannerItemProps {
  image: SharedImageType;
  url?: string | null;
  title?: string | null;
  description?: string | null;
  button?: SharedButtonType | null;
  /** İlk banner sayfanın h1'i olur; diğerleri h2. */
  index?: number;
  sx?: SxProps;
}

const ShopBannerItem = ({ url, image, title, description, button, index = 0, sx }: ShopBannerItemProps) => {
  const styles = useStyles();
  const isVideo = image?.data.attributes.ext === '.mp4';
  const hasOverlay = !!(title || description || button?.label);
  if (!image) return <></>;
  return (
    <Stack sx={sx}>
      <Stack sx={styles.imageContainer}>
        <Link href={url}>
          {isVideo ? (
            <video
              autoPlay
              controls={false}
              muted
              loop
              style={styles.video}
              src={
                (image.data.attributes.url.startsWith('http')
                  ? ''
                  : process.env.NEXT_PUBLIC_IMAGE_HOST) + image.data.attributes.url
              }
            />
          ) : (
            <CMSImage
              src={image.data.attributes.url}
              alt={image.data.attributes.alternativeText || title || 'Mitenya Banner'}
              fill
            />
          )}
        </Link>
        {hasOverlay && (
          <Box sx={styles.overlay}>
            <Stack sx={styles.overlayInner}>
              {title && (
                <Typography sx={styles.title} component={index === 0 ? 'h1' : 'h2'}>
                  {title}
                </Typography>
              )}
              {description && <Typography sx={styles.description}>{description}</Typography>}
              {button?.label && (
                <Box sx={styles.ctaRow}>
                  <Button {...button} sx={styles.ctaButton}>
                    {button.label}
                  </Button>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default ShopBannerItem;
