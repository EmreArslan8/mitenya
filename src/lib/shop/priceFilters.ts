import type { ShopFilter } from '@/lib/api/types';

const TAIL_CEILING_FACTOR = 1.25;

export const parsePriceToken = (token?: string) => {
  if (!token) return null;
  const [minStr, maxStr] = token.split('-');
  const min = Number(minStr);
  const max = maxStr ? Number(maxStr) : null;
  if (!Number.isFinite(min)) return null;
  if (max !== null && !Number.isFinite(max)) return null;
  if (max !== null && max < min) return null;
  return { min, max };
};

export const percentile = (sortedValues: number[], p: number) => {
  if (!sortedValues.length) return 0;
  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
};

export const getRoundingStep = (value: number) => {
  if (value <= 500) return 50;
  if (value <= 2000) return 100;
  if (value <= 5000) return 250;
  return 500;
};

export const roundToStep = (value: number, step: number) => Math.ceil(value / step) * step;

export const buildDynamicPriceFilters = (
  contextualPricesInput: number[],
  selectedPriceToken?: string
): ShopFilter<'price'>[] => {
  const contextualPrices = contextualPricesInput.filter(
    (price): price is number => Number.isFinite(price) && price >= 0
  );
  const sortedContextualPrices = [...contextualPrices].sort((a, b) => a - b);
  const selectedPrice = parsePriceToken(selectedPriceToken);

  if (!sortedContextualPrices.length) return [];

  const p95 = percentile(sortedContextualPrices, 0.95);
  const maxObserved = sortedContextualPrices[sortedContextualPrices.length - 1] ?? 0;
  const selectedUpper = selectedPrice?.max ?? selectedPrice?.min ?? 0;
  const softTailUpper = Math.min(maxObserved, p95 * TAIL_CEILING_FACTOR);
  const rawUpper = Math.max(p95, softTailUpper, selectedUpper);
  const roundingStep = getRoundingStep(rawUpper);
  const upperBound = Math.max(roundToStep(rawUpper, roundingStep), roundingStep);

  const rawEdges = [
    0,
    percentile(sortedContextualPrices, 0.25),
    percentile(sortedContextualPrices, 0.5),
    percentile(sortedContextualPrices, 0.75),
    upperBound,
  ]
    .map((value) => roundToStep(Math.max(0, value), roundingStep))
    .filter((value) => Number.isFinite(value));

  const edges = Array.from(new Set(rawEdges)).sort((a, b) => a - b);
  if (edges[0] !== 0) edges.unshift(0);

  const ranges: Array<{ min: number; max: number | null }> = [];
  for (let i = 0; i < edges.length - 1; i += 1) {
    const min = edges[i];
    const max = edges[i + 1];
    if (max <= min) continue;
    ranges.push({ min, max });
  }
  const openEndedMin = edges[edges.length - 1];
  ranges.push({ min: openEndedMin, max: null });

  const built = ranges.map((range) => {
    const token = `${range.min}-${range.max === null ? '' : range.max}`;
    const countInRange = contextualPrices.filter((price) =>
      range.max === null ? price >= range.min : price >= range.min && price < range.max
    ).length;
    const label = range.max === null ? `${range.min} TL ve üzeri` : `${range.min} - ${range.max} TL`;

    return {
      type: 'price' as const,
      text: `${label} (${countInRange})`,
      count: countInRange,
      searchOptions: { price: token },
      selected: selectedPriceToken === token,
      allowMultiple: false,
    };
  });

  const hasSelectedOption = built.some((filter) => filter.selected);
  if (!hasSelectedOption && selectedPrice) {
    const selectedToken = `${selectedPrice.min}-${selectedPrice.max === null ? '' : selectedPrice.max}`;
    const selectedCount = contextualPrices.filter((price) =>
      selectedPrice.max === null
        ? price >= selectedPrice.min
        : price >= selectedPrice.min && price < selectedPrice.max
    ).length;
    const selectedLabel =
      selectedPrice.max === null
        ? `${selectedPrice.min} TL ve üzeri`
        : `${selectedPrice.min} - ${selectedPrice.max} TL`;
    built.unshift({
      type: 'price' as const,
      text: `${selectedLabel} (${selectedCount})`,
      count: selectedCount,
      searchOptions: { price: selectedToken },
      selected: true,
      allowMultiple: false,
    });
  }

  return built;
};
