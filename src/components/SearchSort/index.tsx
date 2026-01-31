'use client'

import { ShopSearchSort } from '@/lib/api/types';
import searchUrlFromOptions, { searchOptionsFromSearchParams } from '@/lib/shop/searchHelpers';
import { Box, MenuItem, Select } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import LoadingOverlay from '../LoadingOverlay';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

const SearchSort = ({ sortOptions }: { sortOptions: ShopSearchSort[] }) => {

  const searchParams = useSearchParams();
  const router = useRouter();
  const [sort, setSort] = useState<ShopSearchSort>('rct');
  const [loading, setLoading] = useState(false);

  const sortLabels = useMemo<Record<ShopSearchSort, string>>(
    () => ({
      rct: 'Önerilen',
      disc: 'İndirimli',
      pasc: 'Fiyat (Artan)',
      pdsc: 'Fiyat (Azalan)',
      rcc: 'Önerilen',
      bst: 'En çok satan',
      fav: 'En favori',
    }),
    []
  );

  const handleSelect = (sort: ShopSearchSort) => {
    const currentSearchOptions = searchOptionsFromSearchParams(searchParams);
    setSort(sort);
    setLoading(true);
    setTimeout(() => setLoading(false), 5000);
    router.push(searchUrlFromOptions({ ...currentSearchOptions, sort }));
  };

  useEffect(() => {
    const currentSearchOptions = searchOptionsFromSearchParams(searchParams);
    setSort((currentSearchOptions.sort as ShopSearchSort) ?? 'rct');
    setLoading(false);
  }, [searchParams]);

  return (
    <>
      <Select
        size="small"
        value={sort}
        IconComponent={(props) => (
          <Box {...props} sx={{ transition: 'all 0.1s', height: 20 }}>
            <ChevronDown size={20} color="currentColor" />
          </Box>
        )}
        onChange={(e) => handleSelect(e.target.value as ShopSearchSort)}
        startAdornment={
          <Box component="span" sx={{ ml: -0.5, mr: 0.5, color: 'tertiary.main', display: 'inline-flex' }}>
            <ArrowUpDown size={20} color="currentColor" />
          </Box>
        }
      >
        {sortOptions.map((e) => (
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
