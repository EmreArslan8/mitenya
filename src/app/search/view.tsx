'use client';

import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import SearchSort from '@/components/SearchSort';
import { fetchProducts } from '@/lib/api/shop';
import { ShopProductListItemData, ShopSearchResponse } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { Grid, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchProductsViewProps {
  initialData: ShopSearchResponse;
}

const SearchProductsView = ({ initialData }: SearchProductsViewProps) => {
  const { smUp } = useScreen();
  const endOfPageMarkerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams()!;
  const { _, ...searchOptions } = Object.fromEntries(searchParams?.entries() ?? []);
  const [products, setProducts] = useState<ShopProductListItemData[]>(initialData.products);
  const [page, setPage] = useState(parseInt(searchOptions.page ?? 2));
  const [loading, setLoading] = useState(false);
  const _S1Ref = useRef(initialData.session?._S1); // NOTE: refer to h-1-index
  const loadingRef = useRef(false);
  const retryNextPageRef = useRef(3);

  const observerCallback = useCallback(async () => {
    if (!retryNextPageRef.current) {
      setLoading(false);
      return;
    }
    if (loadingRef.current) return;
    setLoading(true);
    loadingRef.current = true;
    console.log("⬇️ [SEARCH] Infinite Scroll Triggered → page:", page);
    fetchProducts({ ...searchOptions, page, nf: true, _S1: _S1Ref.current }).then((data) => {
      console.log("📦 [SEARCH] Infinite Scroll fetch result:", data);
      setLoading(false);
      if (!data?.products) return;
      _S1Ref.current = data.session?._S1;
      if (!data.products.length) {
        loadingRef.current = false;
        retryNextPageRef.current = retryNextPageRef.current - 1;
        return;
      }
      setPage((prev) => prev + 1);
      setProducts((prev) => [...(prev ?? []), ...data.products]);
      loadingRef.current = false;
    });
  }, [loading]);

  useEffect(() => {
    if (
      !products?.length ||
      initialData.totalCount === initialData.products.length ||
      !endOfPageMarkerRef.current
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(async (e) => e.isIntersecting && (await observerCallback())),
      { threshold: 0.1, rootMargin: '0px 0px 1500px 0px' }
    );
    observer.observe(endOfPageMarkerRef.current);
    return () => observer.disconnect();
  }, [products, endOfPageMarkerRef.current]);

  return (
    <>
      <Stack gap={2} mt={{ xs: 3.5, sm: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h3">
        {initialData.totalCount} adet ürün gösteriliyor
          </Typography>
          {smUp && initialData.sortOptions && initialData.sortOptions.length > 1 && (
            <SearchSort sortOptions={initialData.sortOptions} />
          )}
        </Stack>
        <Grid container columnSpacing={2.5} rowSpacing={3}>
          {products?.map((p) => (
            <Grid item xs={6} sm={4} md={3} key={p.url}>
              <ProductCard data={p} />
            </Grid>
          ))}
          {loading &&
            Array.from(Array((products.length % 4) + 4).keys()).map((e) => (
              <Grid item xs={6} sm={4} md={3} key={e}>
                <ProductCardSkeleton />
              </Grid>
            ))}
        </Grid>
        <div ref={endOfPageMarkerRef} style={{ height: '1px', visibility: 'hidden' }} />
      </Stack>
      <ScrollToTopButton />
    </>
  );
};

export default SearchProductsView;
