import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import { buildCloudinaryUrl } from '@/lib/imageLoader';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import CMSImage from '../CMSImage';
import { SharedButtonType, SharedImageType } from '../cmsTypes';
import useStyles from './styles';

/** theme.breakpoints.sm = 600 (src/theme/theme.ts) */
const MOBILE_MEDIA = '(max-width: 599.95px)';

/** Mobil kolon icin uretilen srcset genislikleri (DPR 2-3 dahil). */
const MOBILE_WIDTHS = [360, 420, 480, 640, 750, 828, 1080];

const resolveUrl = (url: string) =>
  url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${url}`;

const buildMobileSrcSet = (url: string) =>
  MOBILE_WIDTHS.map((width) => `${buildCloudinaryUrl({ src: url, width })} ${width}w`).join(', ');

export interface ShopBannerItemProps {
  image: SharedImageType;
  /**
   * Mobil kirpimi. Daha once secim `useMediaQuery` ile client'ta yapiliyordu;
   * sunucu her zaman masaustu gorselini basiyor, dogru gorsel ancak hydration
   * bittikten sonra isteniyordu (LCP'de ~1.5 s Load Delay). Artik iki kaynak da
   * <picture> icine yaziliyor, secimi tarayici parse aninda yapiyor.
   */
  mobileImage?: SharedImageType | null;
  url?: string | null;
  title?: string | null;
  description?: string | null;
  button?: SharedButtonType | null;
  /** İlk banner sayfanın h1'i olur; diğerleri h2. */
  index?: number;
  sx?: SxProps;
}

const ShopBannerItem = ({
  url,
  image,
  mobileImage,
  title,
  description,
  button,
  index = 0,
  sx,
}: ShopBannerItemProps) => {
  const styles = useStyles();
  const isVideo = image?.data.attributes.ext === '.mp4';
  const hasOverlay = !!(title || description || button?.label);
  if (!image) return <></>;

  // Ilk banner LCP adayi: lazy birakilirsa gorsel ancak layout sonrasi
  // isteniyor. `priority` yerine eager+fetchPriority kullaniliyor, cunku
  // priority'nin urettigi <link rel=preload> <picture> media'sini bilmez ve
  // mobilde masaustu gorselini de indirir.
  const isLcpCandidate = index === 0;
  const mobileUrl = mobileImage?.data ? resolveUrl(mobileImage.data.attributes.url) : null;

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
              src={resolveUrl(image.data.attributes.url)}
            />
          ) : (
            // display:contents — <picture> kutu uretmiyor, fill gorsel
            // konumunu yine imageContainer'a gore aliyor.
            <picture style={{ display: 'contents' }}>
              {mobileUrl && (
                <source media={MOBILE_MEDIA} srcSet={buildMobileSrcSet(mobileUrl)} sizes="100vw" />
              )}
              <CMSImage
                src={image.data.attributes.url}
                alt={image.data.attributes.alternativeText || title || 'Mitenya Banner'}
                fill
                sizes="100vw"
                loading={isLcpCandidate ? 'eager' : 'lazy'}
                fetchPriority={isLcpCandidate ? 'high' : 'auto'}
              />
            </picture>
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
