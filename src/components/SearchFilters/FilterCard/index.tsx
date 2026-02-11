'use client';


import Card from '@/components/common/Card';
import { ShopFilter, ShopFilterType } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { Box, Radio, Grid, Stack, TextField, Typography, Checkbox } from '@mui/material';
import { useEffect, useState } from 'react';
import useStyles from './styles';
import Button from '@/components/common/Button';
import { FILTER_TYPE_LABEL_TR } from '@/lib/utils/filters';
import { Search, SearchX } from 'lucide-react';

const showScrollThreshold = 8;

interface FilterCardProps {
  index: number;
  data: ShopFilter<ShopFilterType>[];
  onOptionClicked: (option: ShopFilter<ShopFilterType>) => void;
  showTitleOnMobile?: boolean;
  defaultCollapsedOverride?: boolean;
  singleColumnOnMobile?: boolean;
}

const FilterCard = ({
  index,
  data,
  onOptionClicked,
  showTitleOnMobile = false,
  defaultCollapsedOverride,
  singleColumnOnMobile = false,
}: FilterCardProps) => {

  const styles = useStyles();
  const { smUp } = useScreen();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState(data);
  const type = data[0]?.type;

  const scrollable = data.length > showScrollThreshold;

  useEffect(() => {
    if (!query || !scrollable) {
      setOptions(data);
      return;
    }
    setOptions(data.filter((e) => e.text.toLowerCase().includes(query.toLowerCase())));
  }, [query, data, scrollable]);

  if (!data.length) return <></>;

  return (
    <Card
      title={
        (smUp || showTitleOnMobile) && (
          <Typography variant="cardTitle" fontWeight={600} textTransform="none">
         {FILTER_TYPE_LABEL_TR[type]}
          </Typography>
        )
      }
      noDivider
      collapsible={!(type === 'category' && data.length === 1)}
      defaultCollapsed={defaultCollapsedOverride ?? index > 1}
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
          Önceki kategorilere dön
        </Button>
      )}
      {scrollable && (
        <TextField
          size="small"
          value={query}
          InputProps={{ startAdornment: <Search style={styles.searchIcon} /> }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara..."
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
              options.map((e) => {
                const isUnavailable = e.count === 0 && !e.selected;
                return (
                <Grid item xs={singleColumnOnMobile ? 12 : 6} sm={12} key={JSON.stringify(e.searchOptions) + e.text}>
                  <Stack
                    sx={{
                      ...styles.item,
                      ...(isUnavailable ? styles.itemDisabled : {}),
                      textTransform: type === 'category' ? 'capitalize' : 'initial',
                      fontWeight: e.selected ? 600 : 400,
                    }}
                    onClick={() => {
                      if (isUnavailable) return;
                      onOptionClicked(e);
                    }}
                  >
                    {type === 'price' ? (
                      <Radio
                        size="small"
                        checked={Boolean(e.selected)}
                        disabled={isUnavailable}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => {
                          if (isUnavailable) return;
                          onOptionClicked(e);
                        }}
                        sx={{ ...styles.radio, ...(isUnavailable ? styles.controlDisabled : {}) }}
                      />
                    ) : (
                      e.allowMultiple && (
                        <Checkbox
                          size="small"
                          checked={Boolean(e.selected)}
                          disabled={isUnavailable}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => {
                            if (isUnavailable) return;
                            onOptionClicked(e);
                          }}
                          sx={{ ...styles.checkbox, ...(isUnavailable ? styles.controlDisabled : {}) }}
                        />
                      )
                    )}
                    {e.text}
                  </Stack>
                </Grid>
                );
              })
            ) : (
              <Stack textAlign="center" mt={1}>
                <SearchX  color="tertiary" size={40} />
                <Typography variant="warning">Seçenek bulunamadı</Typography>
              </Stack>
            )}
          </Grid>
        </Stack>
      </Stack>
    </Card>
  );
};

export default FilterCard;
