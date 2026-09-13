'use client';


import {
  ShopFilter,
  ShopFilterType,
  ShopSearchResponseFilters,
  ShopSearchSort,
} from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import searchUrlFromOptions, {
  mergeSearchOptions,
  removeSearchOptions,
  searchOptionsFromSearchParams,
} from '@/lib/shop/searchHelpers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import LoadingOverlay from '../LoadingOverlay';
import FilterCard from './FilterCard';
import MobileFilters from './MobileFilters';
import { Chip } from '@/components/ui/Chip';

interface SearchFiltersProps {
  data: ShopSearchResponseFilters;
  sortOptions?: ShopSearchSort[];
  resultsCount?: number;
}

const FILTER_OPTION_KEYS: ShopFilterType[] = [
  'category',
  'brand',
  'gender',
  'size',
  'color',
  'price',
  'concern',
  'benefit',
];

const SearchFilters = ({ data, sortOptions, resultsCount }: SearchFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = Object.fromEntries(
    Object.entries(data).filter(([key]) => key !== 'selectedOptions')
  ) as Omit<ShopSearchResponseFilters, 'selectedOptions'>;

  const currentSearchOptions = mergeSearchOptions(
    searchOptionsFromSearchParams(searchParams!),
    data.selectedOptions ?? {}
  );
  const filterGroups = useMemo(
    () => Object.values(filters).filter((entry) => Array.isArray(entry) && entry.length > 0) as ShopFilter<ShopFilterType>[][],
    [filters]
  );
  const selectedChips = useMemo(
    () =>
      filterGroups.flatMap((group) =>
        group
          .filter((option) => option.selected)
          .map((option) => ({
            key: `${group[0].type}-${JSON.stringify(option.searchOptions)}`,
            label: option.text.replace(/\s*\(\d+\)\s*$/, '').trim(),
            option,
          }))
      ),
    [filterGroups]
  );

  const [loading, setLoading] = useState(false);
  const isMobile = useScreen('smDown');
  const prevScrollPosition = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleOptionClicked = (option: ShopFilter<ShopFilterType>) => {
    let newOptions;
    if (option.allowMultiple)
      newOptions = option.selected
        ? removeSearchOptions(currentSearchOptions, option.searchOptions)
        : mergeSearchOptions(currentSearchOptions, option.searchOptions);
    else
      newOptions = option.selected
        ? removeSearchOptions(currentSearchOptions, option.searchOptions)
        : { ...currentSearchOptions, [option.type]: option.searchOptions[option.type] };
    const withSalt = JSON.stringify(newOptions) === JSON.stringify(currentSearchOptions);
    router.push(searchUrlFromOptions(newOptions, withSalt));
    setLoading(true);
  };

  const handleClearAllFilters = () => {
    const newOptions = { ...currentSearchOptions };
    FILTER_OPTION_KEYS.forEach((type) => {
      delete newOptions[type];
    });
    router.push(searchUrlFromOptions(newOptions));
    setLoading(true);
  };

  const handleScroll = () => {
    if (!ref.current) return;
    const headerHidden = window.scrollY > 120 && window.scrollY > prevScrollPosition.current;
    ref.current.style.top = headerHidden ? '86px' : '146px';
    ref.current.style.maxHeight = `calc(100vh - ${headerHidden ? 86 : 146}px - 8px)`;
    prevScrollPosition.current = window.scrollY;
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  return (
    <>
      {isMobile ? (
        <MobileFilters
          filters={filters}
          sortOptions={sortOptions}
          resultsCount={resultsCount}
          onOptionClicked={handleOptionClicked}
        />
      ) : (
        <aside className="sticky top-[146px] flex flex-col gap-4 overflow-y-auto pr-1 transition-[top] duration-200 [scrollbar-color:var(--color-gray-400)_transparent] [scrollbar-width:thin]" ref={ref}>
          <div className="flex flex-col gap-2.5 pb-1.5">
            <h2 className="text-xl font-extrabold tracking-[0.01em] text-primaryDark">Filtreleme Seçenekleri</h2>
            <hr className="border-gray-200" />
            {!!selectedChips.length && (
              <div className="flex flex-col gap-4 border-b-2 border-gray-100 pt-2 pb-10">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-primaryDark">Seçilen Filtreler</h3>
                  <button
                    type="button"
                    role="button"
                    className="cursor-pointer appearance-none border-0 bg-transparent text-xs font-semibold tracking-[0.03em] text-primaryDark underline"
                    onClick={handleClearAllFilters}
                  >
                    TEMİZLE
                  </button>
                </div>
                <div className="flex max-h-[110px] flex-wrap gap-3 overflow-y-auto pr-1 [scrollbar-color:var(--color-gray-400)_transparent] [scrollbar-width:thin]">
                  {selectedChips.map((chip) => (
                    <Chip
                      key={chip.key}
                      label={chip.label}
                      onDelete={() => handleOptionClicked(chip.option)}
                      deleteLabel={`${chip.label} filtresini kaldır`}
                      className="h-auto min-h-[30px] rounded-full border border-gray-200 bg-gray-50 px-1.5 py-1"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          {Object.entries(filters).map(([k, v], i) => (
            <div className="flex flex-col gap-4" key={k}>
              <FilterCard
                index={i}
                data={v}
                onOptionClicked={handleOptionClicked}
              />
              {i < Object.keys(filters).length - 1 && <hr className="border-gray-200" />}
            </div>
          ))}
        </aside>
      )}
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default SearchFilters;
