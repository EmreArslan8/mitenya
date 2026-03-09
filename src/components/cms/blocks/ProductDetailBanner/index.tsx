'use client';

import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import CMSImage from '@/components/cms/shared/CMSImage';
import { SharedButtonType, SharedImageType } from '@/components/cms/shared/cmsTypes';
import SectionBase, { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import { Box, Stack, Typography } from '@mui/material';
import useScreen from '@/lib/hooks/useScreen';
import type { BlockComponentBaseProps } from '..';
import useStyles from './styles';

const MARQUEE_ITEMS = [
  'PÜRÜZSÜZLÜK.',
  'YOĞUN NEM.',
  'IŞILTI.',
  'SIKILAŞMA.',
  'CANLILIK.',
];

export interface ProductDetailBannerProps extends BlockComponentBaseProps {
  section?: SectionBaseProps;
  eyebrow?: string;
  title: string;
  description?: string;
  footnote?: string;
  url?: string;
  image: SharedImageType;
  mobileImage?: SharedImageType;
  button?: SharedButtonType;
}

export default function ProductDetailBanner({
  section,
  eyebrow,
  title,
  description,
  footnote,
  url,
  image,
  mobileImage,
  button,
}: ProductDetailBannerProps) {
  const styles = useStyles();
  const { isMobile } = useScreen();

  if (!title || !image?.data?.attributes?.url) return null;

  const selectedImage = isMobile && mobileImage?.data?.attributes?.url ? mobileImage : image;
  const href = url?.trim() || button?.href?.trim() || undefined;
  const imageAttributes = selectedImage.data.attributes;
  const hasStandaloneBannerLink = Boolean(href && !(button?.label && button.href));
  const content = (
    <>
      <Box sx={styles.imageWrap}>
        <CMSImage
          src={imageAttributes.url}
          alt={imageAttributes.alternativeText || title}
          fill
          priority
          fetchPriority="high"
          style={styles.image}
        />
      </Box>

      <Box sx={styles.overlay} />

      <Stack sx={styles.content}>
        <Stack sx={styles.contentTop}>
          {eyebrow ? <Typography sx={styles.eyebrow}>{eyebrow}</Typography> : null}

          <Typography component="h2" sx={styles.title}>
            {title}
          </Typography>

          {description ? <Typography sx={styles.description}>{description}</Typography> : null}

          {button?.label && button.href ? (
            <Box sx={styles.actions}>
              <Button
                href={button.href}
                target={button.target}
                variant={button.variant ?? 'contained'}
                arrow={button.arrow ?? 'end'}
                dataLayerEventId={button.dataLayerEventId}
                sx={styles.button}
              >
                {button.label}
              </Button>
            </Box>
          ) : null}
        </Stack>

        {footnote ? <Typography sx={styles.footnote}>{footnote}</Typography> : null}
      </Stack>
    </>
  );

  return (
    <SectionBase {...(section ?? {})} sx={styles.section}>
      <Stack sx={styles.wrapper}>
        <Box sx={styles.shell}>
          {hasStandaloneBannerLink ? (
            <Link href={href} style={{ display: 'block', minHeight: 'inherit', color: 'inherit' }}>
              {content}
            </Link>
          ) : (
            content
          )}
        </Box>

        <Box sx={styles.marquee}>
          <Box sx={styles.marqueeTrack}>
            {[0, 1].map((row) => (
              <Stack key={row} direction="row" sx={styles.marqueeRow}>
                {MARQUEE_ITEMS.map((item, index) => (
                  <Typography key={`${row}-${item}-${index}`} sx={styles.marqueeText}>
                    {item}
                  </Typography>
                ))}
              </Stack>
            ))}
          </Box>
        </Box>
      </Stack>
    </SectionBase>
  );
}
