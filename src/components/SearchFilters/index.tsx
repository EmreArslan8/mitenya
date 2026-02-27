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
import { Chip, Divider, Stack, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import LoadingOverlay from '../LoadingOverlay';
import FilterCard from './FilterCard';
import MobileFilters from './MobileFilters';
import useStyles from './styles';

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
  const styles = useStyles();
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
          resultsCount={resultsCount}
          onOptionClicked={handleOptionClicked}
        />
      ) : (
        <Stack sx={styles.aside} ref={ref}>
          <Stack sx={styles.headerWrap}>
            <Typography sx={styles.mainTitle}>Filtreleme Seçenekleri</Typography>
            <Divider />
            {!!selectedChips.length && (
              <Stack sx={styles.selectedWrap}>
                <Stack sx={styles.selectedHeader}>
                  <Typography sx={styles.selectedTitle}>Seçilen Filtreler</Typography>
                  <Typography
                    role="button"
                    tabIndex={0}
                    sx={styles.clearAction}
                    onClick={handleClearAllFilters}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleClearAllFilters();
                      }
                    }}
                  >
                    TEMİZLE
                  </Typography>
                </Stack>
                <Stack sx={styles.selectedChipRow}>
                  {selectedChips.map((chip) => (
                    <Chip
                      key={chip.key}
                      label={chip.label}
                      onDelete={() => handleOptionClicked(chip.option)}
                      deleteIcon={<CancelIcon />}
                      sx={styles.selectedChip}
                    />
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
          {Object.entries(filters).map(([k, v], i) => (
            <Stack gap={2} key={k}>
              <FilterCard
                index={i}
                data={v}
                onOptionClicked={handleOptionClicked}
              />
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
