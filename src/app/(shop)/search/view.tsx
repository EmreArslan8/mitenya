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
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProductGrid from '@/components/ProductGrid';

interface SearchProductsViewProps {
  initialData: ShopSearchResponse;
}

const SearchProductsView = ({ initialData }: SearchProductsViewProps) => {
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
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <div className="mb-4 hidden flex-col items-center gap-1.5 text-center sm:flex md:mb-5 md:gap-2">
            {query && (
              <h2 className="text-[30px] font-extrabold text-accentRed">
                “{query}”
              </h2>
            )}
            <p className="font-semibold text-warning">Arama Sonuçları</p>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-y-2 sm:items-center">
          <h3 className="text-lg font-semibold">{initialData.totalCount} adet ürün gösteriliyor</h3>
          {initialData.sortOptions && initialData.sortOptions.length > 1 && (
            <div className="hidden sm:block"><SearchSort sortOptions={initialData.sortOptions} /></div>
          )}
        </div>
        <ProductGrid layout="withSidebar">
          {products?.map((p) => (
            <ProductCard data={p} sizes={SEARCH_CARD_SIZES} key={p.url} />
          ))}
          {loading &&
            Array.from(Array((products.length % 4) + 4).keys()).map((e) => (
              <ProductCardSkeleton key={e} />
            ))}
        </ProductGrid>
        <div ref={endOfPageMarkerRef} style={{ height: '1px', visibility: 'hidden' }} />
      </div>
      <ScrollToTopButton />
    </>
  );
};

export default SearchProductsView;
