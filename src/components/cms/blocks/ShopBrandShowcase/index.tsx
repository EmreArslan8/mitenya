'use client';

import CustomSlider from '@/components/CustomSlider';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import Button from '@/components/common/Button';
import { fetchProducts } from '@/lib/api/shop';
import { ShopProductListItemData, ShopSearchOptions } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import useStyles from './styles';
import { SharedButtonType, SharedImageType } from '../../shared/cmsTypes';
import CMSImage from '../../shared/CMSImage';

export interface ShopBrandShowcaseProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  title: string;
  description: string;
  image: SharedImageType;
  button?: SharedButtonType;
  searchOptions: ShopSearchOptions;
}

const ShopBrandShowcase = ({
  title,
  description,
  image,
  button,
  searchOptions: _searchOptions,
}: ShopBrandShowcaseProps) => {
  const [products, setProducts] = useState<ShopProductListItemData[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { mdUp } = useScreen();
  const styles = useStyles();



  const searchOptions = Object.fromEntries(
    Object.entries(_searchOptions).filter(
      ([k, v]) => !['id', 'blockIndex', 'direction', '__component'].includes(k) && Boolean(v)
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
    <SectionBase sectionWidth="100%" sx={{ py: { xs: 1, md: 2 } }}>
      <Stack sx={styles.wrapper}>
        {/* Header - Başlık + Açıklama + CTA */}
        <Stack sx={styles.header}>
          <Stack sx={styles.headerText}>
            <Typography variant="h2" sx={styles.title}>
              {title}
            </Typography>
            <Typography sx={styles.description}>{description}</Typography>
          </Stack>
          {button && (
            <Button {...button} size="small" sx={{ ml: 'auto', alignSelf: 'flex-start', flexShrink: 0 }}>
            {button.label}
          </Button>
          )}
        </Stack>

        {/* Body - Banner + Slider */}
        <Stack sx={styles.body}>
          {/* Sol - Büyük Banner */}
          <Stack sx={styles.imageWrapper} >
          <CMSImage
              src={image.data.attributes.url}
              alt={image.data.attributes.alternativeText}
              fill
            />
          </Stack>

          {/* Sağ - Ürünler */}
          <Stack sx={styles.productsContainer}>
            {mdUp ? (
              /* Desktop - Slider (ortalanmış, sabit boyut) */
              <Stack sx={styles.sliderWrapper}>
                <CustomSlider
                  slidesToShow={1}
                  infinite={false}
                  pauseOnHover
                >
                  {products.length
                    ? products.map((e) => (
                        <Stack key={e.id} sx={styles.sliderCardWrapper}>
                          <ProductCard data={e} />
                        </Stack>
                      ))
                    : Array.from({ length: 3 }).map((_, i) => (
                        <Stack key={i} sx={styles.sliderCardWrapper}>
                          <ProductCardSkeleton />
                        </Stack>
                      ))}
                </CustomSlider>
              </Stack>
            ) : (
              /* Tablet/Mobile - Grid */
              <Grid container spacing={1.5}>
                {products.length
                  ? products.map((e) => (
                      <Grid item xs={6} sm={4} key={e.id}>
                        <ProductCard data={e} />
                      </Grid>
                    ))
                  : Array.from({ length: 4 }).map((_, i) => (
                      <Grid item xs={6} sm={4} key={i}>
                        <ProductCardSkeleton />
                      </Grid>
                    ))}
              </Grid>
            )}
          </Stack>

        </Stack>
      </Stack>
    </SectionBase>
  );
};

export default ShopBrandShowcase;
