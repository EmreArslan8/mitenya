import { ProductFilterBuilder } from "../api/shopQueryFilters";

type DiscountSortableRow = {
  id: string;
  current_price: number | null;
  original_price: number | null;
};

export type DiscountSortBuilder = ProductFilterBuilder &
  PromiseLike<{ data: DiscountSortableRow[] | null; error: unknown }>;

type DiscountFilterContext = {
  collectionProductIds: string[] | null;
  concernProductIds: string[] | null;
  benefitProductIds: string[] | null;
  applyProductIdFilter: (builder: DiscountSortBuilder, productIds: string[] | null) => DiscountSortBuilder;
  applyCategoryFilter: (builder: DiscountSortBuilder) => DiscountSortBuilder;
  applyBrandFilter: (builder: DiscountSortBuilder) => DiscountSortBuilder;
  applyQueryFilter: (builder: DiscountSortBuilder) => DiscountSortBuilder;
  applyPriceFilter: (builder: DiscountSortBuilder) => DiscountSortBuilder;
};

const getDiscountMetrics = (row: DiscountSortableRow) => {
  const original = Number(row.original_price ?? row.current_price ?? 0);
  const current = Number(row.current_price ?? 0);
  const amount = original > current ? original - current : 0;
  const percent = original > 0 ? amount / original : 0;

  return {
    current,
    amount,
    percent,
  };
};

export const compareDiscountPriority = (
  a: DiscountSortableRow,
  b: DiscountSortableRow
) => {
  const aMetrics = getDiscountMetrics(a);
  const bMetrics = getDiscountMetrics(b);

  if (bMetrics.percent !== aMetrics.percent) {
    return bMetrics.percent - aMetrics.percent;
  }

  if (bMetrics.amount !== aMetrics.amount) {
    return bMetrics.amount - aMetrics.amount;
  }

  return aMetrics.current - bMetrics.current;
};

export const resolveDiscountSortedPageIds = (
  rows: DiscountSortableRow[],
  offset: number,
  limit: number
) => {
  const sortedRows = [...rows].sort(compareDiscountPriority);

  return {
    totalCount: sortedRows.length,
    pageIds: sortedRows
      .slice(offset, offset + limit)
      .map((row) => String(row.id)),
  };
};

export const applyDiscountSortFilters = (
  builder: DiscountSortBuilder,
  context: DiscountFilterContext
) => {
  let nextBuilder = builder;
  nextBuilder = context.applyProductIdFilter(nextBuilder, context.collectionProductIds);
  nextBuilder = context.applyProductIdFilter(nextBuilder, context.concernProductIds);
  nextBuilder = context.applyProductIdFilter(nextBuilder, context.benefitProductIds);
  nextBuilder = context.applyCategoryFilter(nextBuilder);
  nextBuilder = context.applyBrandFilter(nextBuilder);
  nextBuilder = context.applyQueryFilter(nextBuilder);
  nextBuilder = context.applyPriceFilter(nextBuilder);
  return nextBuilder;
};

export const reorderItemsByIds = <T extends { id: string }>(
  items: T[],
  orderedIds: string[]
) => {
  if (!orderedIds.length) return items;

  const itemOrder = new Map(orderedIds.map((itemId, index) => [itemId, index]));

  return [...items].sort(
    (a, b) =>
      (itemOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (itemOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER)
  );
};
