'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import { ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import { UI_SORT_OPTIONS } from '@/lib/constants/shop';
import ProductGrid from '@/components/ProductGrid';
import { Select, SelectItem } from '@/components/ui/Select';

type CategoryViewProps = {
  category: string;
  initialData: ShopSearchResponse;
};

const SORT_LABELS: Record<ShopSearchSort, string> = {
  rct: 'Önerilen',
  disc: 'İndirimli',
  pasc: 'Fiyat (Artan)',
  pdsc: 'Fiyat (Azalan)',
  rcc: 'En Çok Değerlendirilen',
  bst: 'En çok satan',
  fav: 'En favori',
  asc: 'Fiyat (Artan)',
  dsc: 'Fiyat (Azalan)',
};

const CategoryView = ({ category, initialData }: CategoryViewProps) => {
  const allowedUiSorts = UI_SORT_OPTIONS as readonly ShopSearchSort[];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<ShopSearchSort>(
    (searchParams?.get('sort') as ShopSearchSort) ?? 'rct'
  );
  const [isNavigating, setIsNavigating] = useState(false);

  const products = initialData.products ?? [];
  const visibleSortOptions = (initialData.sortOptions ?? ['rct', 'pdsc', 'pasc']).filter(
    (opt) => allowedUiSorts.includes(opt)
  );
  const selectedSort = visibleSortOptions.includes(sort) ? sort : (visibleSortOptions[0] ?? 'rct');

  useEffect(() => {
    setSort((searchParams?.get('sort') as ShopSearchSort) ?? 'rct');
    setIsNavigating(false);
  }, [searchParams]);

  const handleSortChange = (value: ShopSearchSort) => {
    setSort(value);
    setIsNavigating(true);
    const params = new URLSearchParams(searchParams ?? undefined);
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  };

  return (
    <div className="flex flex-col gap-6 px-3 pb-8 sm:px-6">
      <section className="rounded-3xl border border-black/[6%] bg-[linear-gradient(135deg,rgba(193,18,31,0.08)_0%,rgba(17,17,17,0.06)_100%)] p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="font-bold tracking-[1.2px] text-accentRed uppercase">
            Seçili Koleksiyon
          </p>
          <h1 className="text-3xl font-extrabold">
            {category}
          </h1>
          <p className="text-text-secondary">
            {initialData.totalCount} ürün · En yeni eklenenler ve fırsatlar
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-text-secondary">
          Toplam {initialData.totalCount} ürün
        </p>
        <Select
            value={selectedSort}
            onValueChange={(v) => handleSortChange(v as ShopSearchSort)}
            aria-label="Sıralama"
            className="h-9 w-auto min-w-[160px] text-[13px]"
          >
            {visibleSortOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {SORT_LABELS[opt] ?? opt}
              </SelectItem>
            ))}
          </Select>
      </div>

      <ProductGrid>
        {products.map((p) => (
          <ProductCard data={p} key={p.url} />
        ))}
        {isNavigating &&
          Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
      </ProductGrid>
    </div>
  );
};

export default CategoryView;
