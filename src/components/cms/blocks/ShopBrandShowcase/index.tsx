'use client';

import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import Button from '@/components/common/Button';
import { fetchProducts } from '@/lib/api/shop';
import { ShopProductListItemData, ShopSearchOptions } from '@/lib/api/types';
import { Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedButtonType, SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';
import useScreen from '@/lib/hooks/useScreen';

export interface ShopBrandShowcaseProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  title: string;
  description: string;
  image: SharedImageType;
  button?: SharedButtonType;
  searchOptions: ShopSearchOptions;
}

const BRAND_SHOWCASE_IMAGE_SIZES = '(max-width: 900px) 100vw, 55vw';
const BRAND_SHOWCASE_IMAGE_WIDTHS = [384, 768, 1024];

const resolveCmsImageUrl = (src: string) =>
  src.startsWith('http://') || src.startsWith('https://')
    ? src
    : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${src}`;

const buildCloudinaryWidthUrl = (src: string, width: number) => {
  const resolvedSrc = resolveCmsImageUrl(src);
  if (!resolvedSrc.includes('res.cloudinary.com/')) {
    return resolvedSrc;
  }

  return resolvedSrc.replace('/image/upload/', `/image/upload/f_auto,w_${width}/`);
};

const ShopBrandShowcase = ({
  section,
  title,
  description,
  image,
  button,
  searchOptions: _searchOptions,
}: ShopBrandShowcaseProps) => {
  const { smUp } = useScreen();
  const [products, setProducts] = useState<ShopProductListItemData[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const styles = useStyles();
  const showcaseImageSrc = buildCloudinaryWidthUrl(image.data.attributes.url, 768);
  const showcaseImageSrcSet = BRAND_SHOWCASE_IMAGE_WIDTHS.map(
    (width) => `${buildCloudinaryWidthUrl(image.data.attributes.url, width)} ${width}w`
  ).join(', ');

  const searchOptions = Object.fromEntries(
    Object.entries(_searchOptions).filter(
      ([k, v]) =>
        !['id', 'blockIndex', 'direction', '__component'].includes(k) &&
        Boolean(v)
    )
  );

  useEffect(() => {
    setLoading(true);
    fetchProducts(searchOptions)
      .then((res) => {
        const apiResult = Array.isArray(res) ? res[0] : res;
        if (!apiResult?.products || !apiResult.products.length) {
          setError(true);
          return;
        }
        setProducts(apiResult.products);
      })
      .catch((err) => {
        console.error('ShopBrandShowcase → fetchProducts error:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(searchOptions)]);

  if (error) return <></>;

  return (
    <SectionBase {...section}>
      <Stack sx={styles.wrapper}>
        <Stack sx={styles.body}>
          <Stack sx={styles.imageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={showcaseImageSrc}
              srcSet={showcaseImageSrcSet}
              sizes={BRAND_SHOWCASE_IMAGE_SIZES}
              alt={image.data.attributes.alternativeText || title}
              loading="lazy"
              decoding="async"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Stack>
          <Stack sx={styles.header}>
            <Stack sx={styles.headerText}>
              <Typography variant="h2" sx={styles.title}>
                {title}
              </Typography>
              <Typography sx={styles.description}>{description}</Typography>
            </Stack>

            {button && (
              <Button
                size={smUp ? 'medium' : 'small'}
                sx={styles.headerButton}
                href={button.href}
                variant={smUp ? button.variant : 'contained'}
                arrow={button.arrow}
                dataLayerEventId={button.dataLayerEventId}
              >
                {button.label}
              </Button>
            )}
          </Stack>
          <Stack sx={styles.productsContainer}>
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              {products.length
                ? products.map((p) => (
                  <Grid item xs={6} sm={4} md={6} key={p.id}>
                    <ProductCard data={p} />
                  </Grid>
                ))
                : Array.from({ length: 2 }).map((_, i) => (
                  <Grid item xs={6} sm={4} md={6} key={i}>
                    <ProductCardSkeleton />
                  </Grid>
                ))}
            </Grid>
          </Stack>
        </Stack>
      </Stack>
    </SectionBase>
  );
};

export default ShopBrandShowcase;
