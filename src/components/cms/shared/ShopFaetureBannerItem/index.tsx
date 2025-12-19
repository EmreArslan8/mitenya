import Link from '@/components/common/Link';
import { Stack, SxProps } from '@mui/material';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';
import useStyles from './styles';

export interface ShopFeatureBannerItemProps {
  image: SharedImageType;
  url?: string | null;
  sx?: SxProps;
}

const ShopFeatureBannerItem = ({ url, image, sx }: ShopFeatureBannerItemProps) => {
  const styles = useStyles();
  const isVideo = image?.data.attributes.ext === '.mp4';
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
              alt={image.data.attributes.alternativeText}
              fill
            />
          )}
        </Link>
      </Stack>
    </Stack>
  );
};

export default ShopFeatureBannerItem;
