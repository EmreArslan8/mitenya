'use client';

import CustomSlider from '@/components/CustomSlider';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import Button from '@/components/common/Button';
import { fetchProducts } from '@/lib/api/shop';
import { ShopProductListItemData, ShopSearchOptions } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { Grid, Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import useStyles from './styles';
import { useRouter } from 'next/navigation';

export interface ShopInlineProductsProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  searchOptions: ShopSearchOptions;
  cta: string;
  displayType: 'slider' | 'grid';
}
const ShopInlineProducts = ({
  section,
  searchOptions: _searchOptions,
  cta,
  displayType,
}: ShopInlineProductsProps) => {
  const MIN_PRODUCTS = 5;
  const router = useRouter();
  const [products, setProducts] = useState<ShopProductListItemData[]>([]);
  const [error, setError] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(2);
  const [slidesToScroll, setSlidesToScroll] = useState(1);
  const { smUp, mdUp } = useScreen();
  const styles = useStyles();

  useEffect(() => {
    setSlidesToShow(mdUp ? 5.05 : smUp ? 3 : 2);
    setSlidesToScroll(mdUp ? 5 : smUp ? 3 : 1);
  }, [mdUp, smUp]);

  const searchOptions = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(_searchOptions).filter(
          ([k, v]) => !['id', 'blockIndex', 'direction', '__component'].includes(k) && Boolean(v)
        )
      ) as Partial<ShopSearchOptions>,
    [_searchOptions]
  );

  const searchOptionsKey = useMemo(() => JSON.stringify(searchOptions), [searchOptions]);

  useEffect(() => {
    const mergeUniqueById = (
      base: ShopProductListItemData[],
      incoming: ShopProductListItemData[]
    ) => {
      const existingIds = new Set(base.map((p) => p.id));
      return [...base, ...incoming.filter((p) => !existingIds.has(p.id))];
    };

    fetchProducts(searchOptions)
      .then((res) => {
        const apiResult = Array.isArray(res) ? res[0] : res;
        if (!apiResult?.products) {
          setError(true);
          return;
        }

        let nextProducts = apiResult.products;
        if (nextProducts.length >= MIN_PRODUCTS) {
          setProducts(nextProducts);
          return;
        }

        const fallbackOptions: Partial<ShopSearchOptions> = { ...searchOptions };
        delete fallbackOptions.query;

        fetchProducts(fallbackOptions)
          .then((fallbackRes) => {
            const fallbackApiResult = Array.isArray(fallbackRes) ? fallbackRes[0] : fallbackRes;
            const fallbackProducts = fallbackApiResult?.products ?? [];
            nextProducts = mergeUniqueById(nextProducts, fallbackProducts);

            if (nextProducts.length >= MIN_PRODUCTS) {
              setProducts(nextProducts.slice(0, MIN_PRODUCTS));
              return;
            }

            fetchProducts({})
              .then((globalRes) => {
                const globalApiResult = Array.isArray(globalRes) ? globalRes[0] : globalRes;
                const globalProducts = globalApiResult?.products ?? [];
                const completedProducts = mergeUniqueById(nextProducts, globalProducts);

                if (!completedProducts.length) {
                  setError(true);
                  return;
                }

                setProducts(completedProducts.slice(0, MIN_PRODUCTS));
              })
              .catch((err) => {
                console.error('InlineProducts → global fallback error:', err);
                if (!nextProducts.length) {
                  setError(true);
                  return;
                }
                setProducts(nextProducts);
              });
          })
          .catch((err) => {
            console.error('InlineProducts → queryless fallback error:', err);
            if (!nextProducts.length) {
              setError(true);
              return;
            }
            setProducts(nextProducts);
          });
      })
      .catch((err) => {
        console.error('InlineProducts → fetchProducts error:', err);
        setError(true);
      });
  }, [MIN_PRODUCTS, searchOptions, searchOptionsKey]);

  if (error) return <></>;

  return (
    <SectionBase {...section} sectionWidth="100%" sx={{ gap: 2 }}>
      <Stack alignItems="center">
        {displayType === 'grid' ? (
          <Grid container spacing={2} pb={{ xs: 1, sm: 2 }}>
            {products.length
                ? products.slice(0, smUp ? 12 : 8).map((e) => (
                  <Stack px={{ xs: 0.75, sm: 1 }} key={e.id} sx={{ boxSizing: 'border-box' }}>
                    <ProductCard data={e} />
                  </Stack>
                ))
              : Array.from(Array(smUp ? 12 : 8).keys()).map((e) => (
                  <Grid item xs={6} sm={3} md={2} key={e}>
                    <ProductCardSkeleton />
                  </Grid>
                ))}
          </Grid>
        ) : (
          <Stack sx={styles.sliderContainer}>
            <CustomSlider
              slidesToShow={slidesToShow}
              slidesToScroll={slidesToScroll}
              infinite={false}
              pauseOnHover
            >
              {products.length
                ? products.map((e) => (
                    <Stack key={e.id} p={{ xs: 0.75, sm: 1 }} sx={{ boxSizing: 'border-box' }}>
                      <ProductCard data={e} />
                    </Stack>
                  ))
                : Array.from(Array(5).keys()).map((e) => (
                    <Stack key={e} p={{ xs: 0.75, sm: 1 }} sx={{ boxSizing: 'border-box' }}>
                      <ProductCardSkeleton />
                    </Stack>
                  ))}
            </CustomSlider>
          </Stack>
        )}

        {cta && (
          <Button
            color="neutral"
            arrow="end"
            size="small"
            variant="tonal"
            onClick={() => router.push(searchUrlFromOptions(searchOptions))}
          >
            {cta}
          </Button>
        )}
      </Stack>
    </SectionBase>
  );
};

export default ShopInlineProducts;
