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
import CMSImage from '../../shared/CMSImage';
import useStyles from './styles';

export interface ShopBrandShowcaseProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  title: string;
  description: string;
  image: SharedImageType;
  button?: SharedButtonType;
  searchOptions: ShopSearchOptions;
}

const ShopBrandShowcase = ({
  section,
  title,
  description,
  image,
  button,
  searchOptions: _searchOptions,
}: ShopBrandShowcaseProps) => {
  const [products, setProducts] = useState<ShopProductListItemData[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const styles = useStyles();

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
            <CMSImage
              src={image.data.attributes.url}
              alt={image.data.attributes.alternativeText}
              fill
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
                size="small"
                sx={styles.headerButton}
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
