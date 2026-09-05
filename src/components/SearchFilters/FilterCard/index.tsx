'use client';


import Card from '@/components/common/Card';
import { ShopFilter, ShopFilterType } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { Box, Grid, Stack, TextField, Typography, Checkbox, Slider } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import useStyles from './styles';
import Button from '@/components/common/Button';
import { FILTER_TYPE_LABEL_TR } from '@/lib/utils/filters';
import { Search, SearchX } from '@/components/icons';
import { useSearchParams } from 'next/navigation';

const showScrollThreshold = 8;
const PRICE_CAP = 2000;

const parsePriceToken = (token?: string) => {
  if (!token) return null;
  const [minStr, maxStr] = token.split('-');
  const min = Number(minStr);
  const max = maxStr ? Number(maxStr) : null;
  if (!Number.isFinite(min)) return null;
  if (max !== null && !Number.isFinite(max)) return null;
  return { min, max };
};

const serializePriceToken = (min: number, max: number, upperBound: number, openEnded: boolean) => {
  // If max sticks to the top bound, treat it as open-ended.
  if (openEnded || max >= upperBound) return `${min}-`;
  return `${min}-${max}`;
};

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
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState(data);
  const type = data[0]?.type;
  const selectedPrice = searchParams?.get('price') ?? '';
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_CAP]);
  const [isUpperOpenEnded, setIsUpperOpenEnded] = useState(false);

  const scrollable = data.length > showScrollThreshold;
  const isPriceFilter = type === 'price';

  const priceMeta = useMemo(() => {
    if (!isPriceFilter) return null;

    const parsed = data
      .map((e) => parsePriceToken(e.searchOptions.price))
      .filter((e): e is { min: number; max: number | null } => e !== null);

    if (!parsed.length) return { min: 0, max: PRICE_CAP };

    const min = Math.min(...parsed.map((e) => e.min));
    const finiteMaxValues = parsed
      .map((e) => e.max)
      .filter((e): e is number => e !== null && Number.isFinite(e));
    const maxFromFilters = finiteMaxValues.length
      ? Math.max(...finiteMaxValues)
      : Math.max(...parsed.map((e) => e.min));
    const selected = parsePriceToken(selectedPrice);
    const selectedMin = selected?.min ?? min;
    const selectedMax = selected?.max ?? null;
    const max =
      selectedMax !== null && Number.isFinite(selectedMax)
        ? Math.max(maxFromFilters, selectedMax)
        : maxFromFilters;

    return { min: Math.min(min, selectedMin), max };
  }, [data, isPriceFilter, selectedPrice]);

  useEffect(() => {
    if (!isPriceFilter || !priceMeta) return;
    const selected = parsePriceToken(selectedPrice);
    const min = selected?.min ?? priceMeta.min;
    const max = selected?.max ?? priceMeta.max;
    setPriceRange([Math.max(priceMeta.min, min), Math.min(priceMeta.max, max)]);
    setIsUpperOpenEnded(Boolean(selected && selected.max === null));
  }, [isPriceFilter, priceMeta, selectedPrice]);

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
          <Stack>
            <Typography variant="cardTitle" fontWeight={600} textTransform="none">
              {FILTER_TYPE_LABEL_TR[type]}
            </Typography>
          </Stack>
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
      {scrollable && !isPriceFilter && (
        <TextField
          size="small"
          value={query}
          InputProps={{ startAdornment: <Search style={styles.searchIcon} /> }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara..."
          sx={styles.searchInput}
        />
      )}
      {isPriceFilter ? (
        <Stack sx={styles.priceWrapper}>
          <Slider
            min={priceMeta?.min ?? 0}
            max={priceMeta?.max ?? PRICE_CAP}
            value={priceRange}
            onChange={(_, newValue) => {
              const [nextMin, nextMax] = newValue as [number, number];
              setPriceRange([nextMin, nextMax]);
              if (nextMax < (priceMeta?.max ?? PRICE_CAP)) setIsUpperOpenEnded(false);
            }}
            valueLabelDisplay="off"
            sx={styles.priceSlider}
          />
          <Stack sx={styles.priceInputsRow}>
            <TextField
              size="small"
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const nextMin = Number(e.target.value);
                if (!Number.isFinite(nextMin)) return;
                setPriceRange(([, max]) => [Math.min(nextMin, max), max]);
              }}
              sx={styles.priceInput}
              inputProps={{ min: priceMeta?.min ?? 0, max: priceRange[1] }}
            />
            <Typography sx={styles.priceTo}>ile</Typography>
            <TextField
              size="small"
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const nextMax = Number(e.target.value);
                if (!Number.isFinite(nextMax)) return;
                setPriceRange(([min]) => [min, Math.max(nextMax, min)]);
                setIsUpperOpenEnded(false);
              }}
              sx={styles.priceInput}
              inputProps={{ min: priceRange[0], max: priceMeta?.max ?? PRICE_CAP }}
              disabled={isUpperOpenEnded}
            />
          </Stack>
          <Button
            size="small"
            color="primary"
            variant="contained"
            sx={styles.priceApplyButton}
            onClick={() => {
              const nextPrice = serializePriceToken(
                priceRange[0],
                priceRange[1],
                priceMeta?.max ?? PRICE_CAP,
                isUpperOpenEnded
              );
              onOptionClicked({
                type: 'price',
                text: nextPrice,
                searchOptions: { price: nextPrice },
                selected: false,
                allowMultiple: false,
              } as ShopFilter<'price'>);
            }}
          >
            Uygula
          </Button>
        </Stack>
      ) : (
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
                    {e.allowMultiple && (
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
      )}
    </Card>
  );
};

export default FilterCard;
