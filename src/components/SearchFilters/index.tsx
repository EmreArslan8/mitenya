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
import { Divider, Stack } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import LoadingOverlay from '../LoadingOverlay';
import FilterCard from './FilterCard';
import MobileFilters from './MobileFilters';
import useStyles from './styles';

interface SearchFiltersProps {
  data: ShopSearchResponseFilters;
  sortOptions?: ShopSearchSort[];
}

const SearchFilters = ({ data, sortOptions }: SearchFiltersProps) => {
  const styles = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedOptions, ...filters } = data;

  const currentSearchOptions = mergeSearchOptions(
    searchOptionsFromSearchParams(searchParams!),
    data.selectedOptions ?? {}
  );

  const [loading, setLoading] = useState(false);
  const { isMobile } = useScreen();
  const prevScrollPosition = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(true);

  const handleOptionClicked = (option: ShopFilter<ShopFilterType>) => {
    let newOptions;
    if (option.allowMultiple)
      newOptions = option.selected
        ? removeSearchOptions(currentSearchOptions, option.searchOptions)
        : mergeSearchOptions(currentSearchOptions, option.searchOptions);
    else newOptions = { ...currentSearchOptions, [option.type]: option.searchOptions[option.type] };
    const withSalt = JSON.stringify(newOptions) === JSON.stringify(currentSearchOptions);
    router.push(searchUrlFromOptions(newOptions, withSalt));
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
    isMobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  return (
    <>
      {isMobile ? (
        <MobileFilters
          filters={filters}
          sortOptions={sortOptions}
          onOptionClicked={handleOptionClicked}
        />
      ) : (
        <Stack sx={styles.aside} ref={ref}>
          {Object.entries(filters).map(([k, v], i) => (
            <Stack gap={2} key={k}>
              <FilterCard index={i} data={v} onOptionClicked={handleOptionClicked} />
              {i < Object.keys(filters).length - 1 && <Divider />}
            </Stack>
          ))}
        </Stack>
      )}
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default SearchFilters;
