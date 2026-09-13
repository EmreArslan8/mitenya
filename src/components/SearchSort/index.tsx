'use client'

import { ShopSearchSort } from '@/lib/api/types';
import searchUrlFromOptions, { searchOptionsFromSearchParams } from '@/lib/shop/searchHelpers';
import { UI_SORT_OPTIONS } from '@/lib/constants/shop';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import LoadingOverlay from '../LoadingOverlay';
import { ArrowUpDown, ChevronDown } from '@/components/icons';
import { Select, SelectItem } from '@/components/ui/Select';
import { cn } from '@/lib/utils/cn';

interface SearchSortProps {
  sortOptions: ShopSearchSort[];
  mobileTriggerLabel?: string;
  buttonLike?: boolean;
  hideSelectedValue?: boolean;
}

const SearchSort = ({
  sortOptions,
  mobileTriggerLabel,
  buttonLike = false,
  hideSelectedValue = false,
}: SearchSortProps) => {
  const allowedUiSorts = UI_SORT_OPTIONS as readonly ShopSearchSort[];
  const searchParams = useSearchParams()!;
  const router = useRouter();
  const [sort, setSort] = useState<ShopSearchSort>('rct');
  const [loading, setLoading] = useState(false);
  const visibleSortOptions = useMemo(
    () => sortOptions.filter((option) => allowedUiSorts.includes(option)),
    [sortOptions, allowedUiSorts]
  );
  const selectedSort = visibleSortOptions.includes(sort) ? sort : (visibleSortOptions[0] ?? 'rct');

  const sortLabels = useMemo<Record<ShopSearchSort, string>>(
    () => ({
      rct: 'Önerilen',
      disc: 'İndirimli',
      pasc: 'Fiyat (Artan)',
      pdsc: 'Fiyat (Azalan)',
      rcc: 'En Çok Değerlendirilen',
      bst: 'En çok satan',
      fav: 'En favori',
      asc: 'En eski',
      dsc: 'En yeni',
    }),
    []
  );

  const handleSelect = (sort: ShopSearchSort) => {
    const currentSearchOptions = searchOptionsFromSearchParams(searchParams);
    const nextUrl = searchUrlFromOptions({ ...currentSearchOptions, sort });
    setSort(sort);
    setLoading(true);
    setTimeout(() => setLoading(false), 5000);
    router.push(nextUrl);
  };

  useEffect(() => {
    const currentSearchOptions = searchOptionsFromSearchParams(searchParams);
    const currentSort = (currentSearchOptions.sort as ShopSearchSort) ?? 'rct';
    setSort(visibleSortOptions.includes(currentSort) ? currentSort : (visibleSortOptions[0] ?? 'rct'));
    setLoading(false);
  }, [searchParams, visibleSortOptions]);

  return (
    <>
      <Select
        value={selectedSort}
        onValueChange={(v) => handleSelect(v as ShopSearchSort)}
        aria-label="Sıralama"
        hideIcon={buttonLike}
        className={cn(
          buttonLike
            ? 'h-[50px] w-full justify-center px-[14px] text-[17px] font-extrabold uppercase leading-none'
            : 'h-9 w-auto min-w-[170px] text-[13px]',
        )}
        renderValue={(value) =>
          buttonLike ? (
            <span className="inline-flex w-full items-center justify-center gap-[6px] font-extrabold leading-none tracking-[0.01em]">
              <ArrowUpDown size={17} color="currentColor" />
              <span>
                {hideSelectedValue
                  ? mobileTriggerLabel ?? 'Sırala'
                  : sortLabels[value as ShopSearchSort] ?? value}
              </span>
              <ChevronDown size={16} color="currentColor" />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex text-tertiary">
                <ArrowUpDown size={20} color="currentColor" />
              </span>
              {hideSelectedValue
                ? mobileTriggerLabel ?? 'Sırala'
                : sortLabels[value as ShopSearchSort] ?? value}
            </span>
          )
        }
      >
        {visibleSortOptions.map((e) => (
          <SelectItem value={e} key={e}>
            {sortLabels[e] ?? e}
          </SelectItem>
        ))}
      </Select>
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default SearchSort;
