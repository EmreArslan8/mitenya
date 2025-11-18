'use client';

import Icon from '@/components/Icon';
import Card from '@/components/common/Card';
import { ShopFilter, ShopFilterType } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { Box, Radio, Grid, Stack, TextField, Typography, Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import useStyles from './styles';
import Button from '@/components/common/Button';

const showScrollThreshold = 8;

interface FilterCardProps {
  index: number;
  data: ShopFilter<ShopFilterType>[];
  onOptionClicked: (option: ShopFilter<ShopFilterType>) => void;
}

const FilterCard = ({ index, data, onOptionClicked }: FilterCardProps) => {

  const styles = useStyles();
  const { smUp } = useScreen();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState(data);
  const type = data[0]?.type;

  const scrollable = data.length > showScrollThreshold;

  useEffect(() => {
    if (!scrollable) return;
    if (!query) return setOptions(data);
    setOptions(data.filter((e) => e.text.toLowerCase().includes(query.toLowerCase())));
  }, [query]);

  if (!data.length) return <></>;

  return (
    <Card
      title={
        smUp && (
          <Typography variant="cardTitle" fontWeight={600} textTransform="none">
            {(`filters.${type}`)}
          </Typography>
        )
      }
      noDivider
      collapsible={!(type === 'category' && data.length === 1)}
      defaultCollapsed={index > 1}
      sx={styles.card}
    >
      {type === 'category' && data.length === 1 && (
        <Button
          size="small"
          arrow="start"
          color="primary"
          sx={{ alignSelf: 'start', mx: -1.5, '&:hover': { background: 'transparent' } }}
          onClick={() => onOptionClicked({ ...data[0], selected: true, allowMultiple: true })}
        >
          {('filters.backToPreviousCategories')}
        </Button>
      )}
      {scrollable && (
        <TextField
          size="small"
          value={query}
          InputProps={{ startAdornment: <Icon name="search" sx={styles.searchIcon} /> }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={'filters.searchPlaceholder'}
          sx={styles.searchInput}
        />
      )}
      <Stack position="relative">
        {scrollable && (
          <>
            <Box sx={styles.itemsShadowTop} />
            <Box sx={styles.itemsShadowBottom} />
          </>
        )}
        <Stack sx={styles.items}>
          <Grid container columnSpacing={2}>
            {options.length ? (
              options.map((e) => (
                <Grid item xs={6} sm={12} key={JSON.stringify(e.searchOptions) + e.text}>
                  <Stack
                    sx={{
                      ...styles.item,
                      textTransform: type === 'category' ? 'capitalize' : 'initial',
                      fontWeight: e.selected ? 600 : 400,
                    }}
                    onClick={() => onOptionClicked(e)}
                  >
                    {type === 'price' ? (
                      <Radio size="small" checked={e.selected} sx={styles.radio} />
                    ) : (
                      e.allowMultiple && (
                        <Checkbox size="small" defaultChecked={e.selected} sx={styles.checkbox} />
                      )
                    )}
                    {type === 'gender' ? (`filters.genders.${e.text}`) : e.text}
                  </Stack>
                </Grid>
              ))
            ) : (
              <Stack textAlign="center" mt={1}>
                <Icon name="search_off" color="tertiary" fontSize={40} />
                <Typography variant="warning">{('filters.noOptionsFound')}</Typography>
              </Stack>
            )}
          </Grid>
        </Stack>
      </Stack>
    </Card>
  );
};

export default FilterCard;
