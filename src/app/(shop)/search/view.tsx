'use client';

import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';

/**
 * Olculen gercek slot genislikleri (filtre sidebar'i kabi daraltiyor):
 *   390px -> 177px (45.4vw) | 600px -> 83px (13.8vw) | 768px -> 139px (18.1vw)
 *   1024px -> 221px (21.6vw) | 1440px+ -> 332px (kap max'a ulasiyor)
 *
 * Sidebar SABIT genislikte oldugu icin kartin vw orani viewport buyudukce
 * artiyor; tek bir vw degeri yetmiyor, uc kademe gerekiyor. Sidebar sm'de
 * (600px) devreye girdigi icin ilk kirilma 599px.
 */
const SEARCH_CARD_SIZES =
  '(max-width: 599px) 46vw, (max-width: 899px) 18vw, (max-width: 1199px) 22vw, 340px';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import SearchSort from '@/components/SearchSort';
import { fetchProducts } from '@/lib/api/shop';
import { ShopProductListItemData, ShopSearchResponse } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { Grid, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface SearchProductsViewProps {
  initialData: ShopSearchResponse;
}

const SearchProductsView = ({ initialData }: SearchProductsViewProps) => {
  const { smUp } = useScreen();
  const endOfPageMarkerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams()!;
  const searchParamsKey = searchParams.toString();
  const searchOptions = useMemo(
    () => {
      const entries = Object.fromEntries(searchParams.entries() ?? []) as Record<string, string>;
      delete entries._;
      return entries;
    },
    [searchParams]
  );
  const query = useMemo(() => searchParams.get('query')?.trim() ?? '', [searchParams]);
  const [products, setProducts] = useState<ShopProductListItemData[]>(initialData.products);
  const [page, setPage] = useState(parseInt(searchOptions.page ?? 2));
  const [loading, setLoading] = useState(false);
  const _S1Ref = useRef(initialData.session?._S1); // NOTE: refer to h-1-index
  const loadingRef = useRef(false);
  const retryNextPageRef = useRef(3);

  // Ref'ler ile stale closure önlenir — observerCallback stabil kalır
  const pageRef = useRef(page);
  pageRef.current = page;
  const searchOptionsRef = useRef(searchOptions);
  searchOptionsRef.current = searchOptions;

  const observerCallback = useCallback(async () => {
    if (!retryNextPageRef.current) {
      setLoading(false);
      return;
    }
    if (loadingRef.current) return;
    setLoading(true);
    loadingRef.current = true;
    const currentPage = pageRef.current;
    fetchProducts({ ...searchOptionsRef.current, page: currentPage, nf: true, _S1: _S1Ref.current }).then((data) => {
      setLoading(false);
      loadingRef.current = false;
      if (!data?.products) return;
      _S1Ref.current = data.session?._S1;
      if (!data.products.length) {
        retryNextPageRef.current = retryNextPageRef.current - 1;
        return;
      }
      setPage((prev) => prev + 1);
      setProducts((prev) => {
        const existingUrls = new Set((prev ?? []).map((p) => p.url));
        const newProducts = data.products.filter((p) => !existingUrls.has(p.url));
        return [...(prev ?? []), ...newProducts];
      });
    });
  }, []);

  useEffect(() => {
    setProducts(initialData.products ?? []);
    setPage(parseInt((searchOptions.page as string) ?? '2'));
    setLoading(false);
    _S1Ref.current = initialData.session?._S1;
    loadingRef.current = false;
    retryNextPageRef.current = 3;
  }, [initialData, searchParamsKey, searchOptions.page]);

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
  }, [products, initialData.totalCount, initialData.products.length, observerCallback]);

  return (
    <>
      <Stack gap={{ xs: 1.25, sm: 1.5 }} >
        {smUp && (
          <Stack
            gap={{ xs: 0.5, sm: 0.75, md: 1 }}
            alignItems="center"
            sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 2, md: 2.5 } }}
          >
            {query && (
              <Typography
                variant="h2"
                sx={{ color: 'accentRed.main', fontWeight: 800, fontSize: { xs: 26, sm: 30 } }}
              >
                “{query}”
              </Typography>
            )}
            <Typography variant="warningSemibold">Arama Sonuçları</Typography>
          </Stack>
        )}
        <Stack
          direction="row"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          flexWrap="wrap"
          rowGap={1}
        >
          <Typography variant="h3">{initialData.totalCount} adet ürün gösteriliyor</Typography>
          {smUp && initialData.sortOptions && initialData.sortOptions.length > 1 && (
            <SearchSort sortOptions={initialData.sortOptions} />
          )}
        </Stack>
        <Grid container columnSpacing={2.5} rowSpacing={3}>
          {products?.map((p) => (
            <Grid item xs={6} sm={4} md={4} key={p.url}>
              <ProductCard data={p} sizes={SEARCH_CARD_SIZES} />
            </Grid>
          ))}
          {loading &&
            Array.from(Array((products.length % 4) + 4).keys()).map((e) => (
              <Grid item xs={6} sm={4} md={4} key={e}>
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
