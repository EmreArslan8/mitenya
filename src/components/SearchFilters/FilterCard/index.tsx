'use client';


import Card from '@/components/common/Card';
import { ShopFilter, ShopFilterType } from '@/lib/api/types';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { FILTER_TYPE_LABEL_TR } from '@/lib/utils/filters';
import { Search, SearchX } from '@/components/icons';
import { useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/Checkbox';
import { Slider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import useScreen from '@/lib/hooks/useScreen';

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

  const smUp = useScreen('smUp');
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
          <span className="font-semibold normal-case">{FILTER_TYPE_LABEL_TR[type]}</span>
        )
      }
      noDivider
      collapsible={!(type === 'category' && data.length === 1)}
      defaultCollapsed={defaultCollapsedOverride ?? index > 1}
      headerClassName="p-0"
    >
      {type === 'category' && data.length === 1 && (
        <Button
          size="small"
          arrow="start"
          color="primary"
          variant="text"
          className="-mx-3 self-start hover:bg-transparent"
          onClick={() => onOptionClicked({ ...data[0], selected: true, allowMultiple: true })}
        >
          Önceki kategorilere dön
        </Button>
      )}
      {scrollable && !isPriceFilter && (
        <Input
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara..."
          aria-label="Filtre içinde ara"
          /* Eski styles.searchInput: m {xs:'0 0 4px', sm:'8px 0 2px'} */
          className="mb-1 sm:mb-0.5 sm:mt-2"
          startSlot={<Search className="shrink-0 text-[20px] sm:text-[15px]" />}
        />
      )}
      {isPriceFilter ? (
        <div className="flex w-full max-w-full flex-col gap-2.5 overflow-visible pt-1.5">
          <Slider
            min={priceMeta?.min ?? 0}
            max={priceMeta?.max ?? PRICE_CAP}
            value={priceRange}
            onValueChange={(next) => {
              const [nextMin, nextMax] = next as [number, number];
              setPriceRange([nextMin, nextMax]);
              if (nextMax < (priceMeta?.max ?? PRICE_CAP)) setIsUpperOpenEnded(false);
            }}
            ariaLabels={['En düşük fiyat', 'En yüksek fiyat']}
          />
          <div className="flex items-center justify-between gap-1.5">
            <Input
              size="small"
              type="number"
              inputMode="numeric"
              value={priceRange[0]}
              onChange={(e) => {
                const nextMin = Number(e.target.value);
                if (!Number.isFinite(nextMin)) return;
                setPriceRange(([, max]) => [Math.min(nextMin, max), max]);
              }}
              aria-label="En düşük fiyat"
              className="w-[48%]"
            />
            <span className="text-sm text-text-medium">ile</span>
            <Input
              size="small"
              type="number"
              inputMode="numeric"
              value={priceRange[1]}
              onChange={(e) => {
                const nextMax = Number(e.target.value);
                if (!Number.isFinite(nextMax)) return;
                setPriceRange(([min]) => [min, Math.max(nextMax, min)]);
                setIsUpperOpenEnded(false);
              }}
              aria-label="En yüksek fiyat"
              className="w-[48%]"
              disabled={isUpperOpenEnded}
            />
          </div>
          <Button
            size="small"
            color="primary"
            variant="contained"
            className="mt-0.5 min-h-[46px] w-full min-w-[120px] self-stretch rounded-xl font-extrabold tracking-[0.03em] uppercase"
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
        </div>
      ) : (
      <div className="relative">
        {scrollable && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-2.5 bg-gradient-to-t from-white/20 to-white" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2.5 bg-gradient-to-b from-white/20 to-white" />
          </>
        )}
        <div className="max-h-none w-full overflow-y-auto py-1 pr-1 [scrollbar-color:var(--color-gray-400)_transparent] [scrollbar-width:thin] sm:max-h-[230px]">
          <div className={cn('grid gap-x-4', singleColumnOnMobile ? 'grid-cols-1' : 'grid-cols-2', 'sm:grid-cols-1')}>
            {options.length ? (
              options.map((e) => {
                const isUnavailable = e.count === 0 && !e.selected;
                return (
                <div key={JSON.stringify(e.searchOptions) + e.text}>
                  <div
                    className={cn(
                      'flex shrink-0 cursor-pointer items-center gap-2 py-2 text-[19px] leading-[1.35] text-text-medium sm:gap-1 sm:py-1 sm:text-sm sm:leading-[1.25]',
                      isUnavailable && 'cursor-not-allowed opacity-60',
                      type === 'category' && 'capitalize',
                      e.selected && 'font-semibold',
                    )}
                    onClick={() => {
                      if (isUnavailable) return;
                      onOptionClicked(e);
                    }}
                  >
                    {e.allowMultiple && (
                      <Checkbox
                        checked={Boolean(e.selected)}
                        disabled={isUnavailable}
                        onCheckedChange={() => {
                          if (isUnavailable) return;
                          onOptionClicked(e);
                        }}
                        /* Satır da onOptionClicked çağırıyor; guard olmazsa
                           filtre uygulanıp anında geri alınır. */
                        onClick={(event) => event.stopPropagation()}
                        aria-label={e.text}
                      />
                    )}
                    {e.text}
                  </div>
                </div>
                );
              })
            ) : (
              <div className="mt-2 flex flex-col items-center text-center">
                <SearchX  color="tertiary" size={40} />
                <p className="text-warning">Seçenek bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </Card>
  );
};

export default FilterCard;
