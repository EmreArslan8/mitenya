'use client'

import { ShopSearchSort } from '@/lib/api/types';
import searchUrlFromOptions, { searchOptionsFromSearchParams } from '@/lib/shop/searchHelpers';
import { UI_SORT_OPTIONS } from '@/lib/constants/shop';
import { Box, MenuItem, Select } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import LoadingOverlay from '../LoadingOverlay';
import { ArrowUpDown, ChevronDown } from '@/components/icons';

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
        size="small"
        value={selectedSort}
        displayEmpty
        IconComponent={(props) => (
          buttonLike ? <Box {...props} sx={{ display: 'none' }} /> : (
            <Box {...props} sx={{ transition: 'all 0.1s', height: 20 }}>
              <ChevronDown size={20} color="currentColor" />
            </Box>
          )
        )}
        renderValue={(value) =>
          buttonLike ? (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.8,
                width: '100%',
                fontWeight: 800,
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              <ArrowUpDown size={17} color="currentColor" />
              <Box component="span">
                {hideSelectedValue
                ? mobileTriggerLabel ?? 'Sırala'
                : sortLabels[value as ShopSearchSort] ?? value}
              </Box>
              <ChevronDown size={16} color="currentColor" />
            </Box>
          ) : hideSelectedValue ? (
            mobileTriggerLabel ?? 'Sırala'
          ) : (
            sortLabels[value as ShopSearchSort] ?? value
          )
        }
        onChange={(e) => handleSelect(e.target.value as ShopSearchSort)}
        startAdornment={!buttonLike ? (
          <Box
            component="span"
            sx={{
              ml: hideSelectedValue ? 0 : -0.5,
              mr: 0.5,
              color: 'tertiary.main',
              display: 'inline-flex',
            }}
          >
            <ArrowUpDown size={20} color="currentColor" />
          </Box>
        ) : undefined}
        sx={
          buttonLike
            ? {
                width: '100%',
                '& .MuiSelect-select': {
                  minHeight: 'unset !important',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0,
                  py: '0 !important',
                  px: '14px !important',
                  height: 50,
                  fontWeight: 800,
                  fontSize: 17,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  letterSpacing: '0.01em',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiInputBase-root': {
                  borderRadius: 0,
                },
                '& .MuiSelect-iconOpen': {
                  transform: 'none',
                },
              }
            : undefined
        }
      >
        {visibleSortOptions.map((e) => (
          <MenuItem value={e} key={e}>
            {sortLabels[e] ?? e}
          </MenuItem>
        ))}
      </Select>
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default SearchSort;
