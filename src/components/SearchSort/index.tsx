'use client'

import Icon from '@/components/Icon';
import { ShopSearchSort } from '@/lib/api/types';
import searchUrlFromOptions, { searchOptionsFromSearchParams } from '@/lib/shop/searchHelpers';
import { Box, MenuItem, Select } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingOverlay from '../LoadingOverlay';

const SearchSort = ({ sortOptions }: { sortOptions: ShopSearchSort[] }) => {

  const searchParams = useSearchParams();
  const currentSearchOptions = searchOptionsFromSearchParams(searchParams!);
  const router = useRouter();
  const [sort, setSort] = useState((currentSearchOptions.sort as ShopSearchSort) ?? 'rcc');
  const [loading, setLoading] = useState(false);

  const handleSelect = (sort: ShopSearchSort) => {
    setSort(sort);
    setLoading(true);
    setTimeout(() => setLoading(false), 5000);
    router.push(searchUrlFromOptions({ ...currentSearchOptions, sort }));
  };

  useEffect(() => {
    setLoading(false);
  }, [searchParams]);

  return (
    <>
      <Select
        size="small"
        value={sort}
        IconComponent={(props) => (
          <Box {...props} sx={{ transition: 'all 0.1s', height: 20 }}>
            <Icon name="expand_more" fontSize={20} />
          </Box>
        )}
        onChange={(e) => handleSelect(e.target.value as ShopSearchSort)}
        startAdornment={
          <Icon name="swap_vert" fontSize={20} color="tertiary" sx={{ ml: -0.5, mr: 0.5 }} />
        }
      >
        {sortOptions.map((e) => (
          <MenuItem value={e} key={e}>
            {(e)}
          </MenuItem>
        ))}
      </Select>
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default SearchSort;
