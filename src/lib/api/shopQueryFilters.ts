export type InFilterBuilder = {
  in: (column: string, values: string[]) => unknown;
};

export type QueryFilterBuilder = {
  or: (filters: string) => unknown;
};

export type PriceFilterBuilder = {
  gte: (column: string, value: number) => unknown;
  lte: (column: string, value: number) => unknown;
};

export type ProductFilterBuilder = InFilterBuilder &
  QueryFilterBuilder &
  PriceFilterBuilder;

type ProductIdFilter = <T extends InFilterBuilder>(
  builder: T,
  productIds: string[] | null
) => T;

type InBuilderFilter = <T extends InFilterBuilder>(builder: T) => T;
type QueryBuilderFilter = <T extends QueryFilterBuilder>(builder: T) => T;
type PriceBuilderFilter = <T extends PriceFilterBuilder>(builder: T) => T;

type ProductFilterBundle = {
  query: ProductFilterBuilder;
  priceAggQuery: ProductFilterBuilder;
  categoryAggQuery: ProductFilterBuilder;
  brandAggQuery: ProductFilterBuilder;
  concernAggQuery: ProductFilterBuilder;
  benefitAggQuery: ProductFilterBuilder;
};

type SharedFilterContext = {
  applyCategoryFilter: InBuilderFilter;
  applyBrandFilter: InBuilderFilter;
  applyQueryFilter: QueryBuilderFilter;
  applyPriceFilter: PriceBuilderFilter;
};

export const createApplyProductIdFilter =
  (): ProductIdFilter =>
  <T extends InFilterBuilder>(builder: T, productIds: string[] | null): T =>
    (productIds ? builder.in("id", productIds) : builder) as T;

export const createApplyCategoryFilter =
  (selectedCategoryIds: string[]): InBuilderFilter =>
  <T extends InFilterBuilder>(builder: T): T =>
    (selectedCategoryIds.length
      ? builder.in("category_id", selectedCategoryIds)
      : builder) as T;

export const createApplyBrandFilter =
  (selectedBrandIds: string[]): InBuilderFilter =>
  <T extends InFilterBuilder>(builder: T): T =>
    (selectedBrandIds.length
      ? builder.in("brand_id", selectedBrandIds)
      : builder) as T;

export const createApplyQueryFilter =
  (selectedQueryTokens: string[]): QueryBuilderFilter =>
  <T extends QueryFilterBuilder>(builder: T): T => {
    let nextBuilder = builder;
    for (const token of selectedQueryTokens) {
      nextBuilder = nextBuilder.or(
        `name.ilike.%${token}%,brand_name.ilike.%${token}%,category_name.ilike.%${token}%`
      ) as T;
    }
    return nextBuilder;
  };

export const createApplyPriceFilter =
  (price?: string): PriceBuilderFilter =>
  <T extends PriceFilterBuilder>(builder: T): T => {
    if (!price) return builder;
    const [minStr, maxStr] = price.split("-");
    const min = Number(minStr);
    const max = maxStr ? Number(maxStr) : null;
    if (!Number.isFinite(min)) return builder;
    const minFiltered = builder.gte("current_price", min) as T;
    if (max && Number.isFinite(max)) {
      return (minFiltered as T & PriceFilterBuilder).lte("current_price", max) as T;
    }
    return minFiltered;
  };

export const applyProductIdFiltersToBundle = <TBundle extends ProductFilterBundle>(
  bundle: TBundle,
  productIds: string[] | null,
  applyProductIdFilter: ProductIdFilter
): TBundle =>
  ({
    ...bundle,
    query: applyProductIdFilter(bundle.query, productIds),
    priceAggQuery: applyProductIdFilter(bundle.priceAggQuery, productIds),
    categoryAggQuery: applyProductIdFilter(bundle.categoryAggQuery, productIds),
    brandAggQuery: applyProductIdFilter(bundle.brandAggQuery, productIds),
    concernAggQuery: applyProductIdFilter(bundle.concernAggQuery, productIds),
    benefitAggQuery: applyProductIdFilter(bundle.benefitAggQuery, productIds),
  }) as TBundle;

export const applySharedFiltersToBundle = <TBundle extends ProductFilterBundle>(
  bundle: TBundle,
  context: SharedFilterContext
): TBundle =>
  ({
    ...bundle,
    query: context.applyPriceFilter(
      context.applyQueryFilter(
        context.applyBrandFilter(context.applyCategoryFilter(bundle.query))
      )
    ),
    priceAggQuery: context.applyQueryFilter(
      context.applyBrandFilter(context.applyCategoryFilter(bundle.priceAggQuery))
    ),
    categoryAggQuery: context.applyPriceFilter(
      context.applyQueryFilter(context.applyBrandFilter(bundle.categoryAggQuery))
    ),
    brandAggQuery: context.applyPriceFilter(
      context.applyQueryFilter(context.applyCategoryFilter(bundle.brandAggQuery))
    ),
    concernAggQuery: context.applyPriceFilter(
      context.applyQueryFilter(
        context.applyBrandFilter(context.applyCategoryFilter(bundle.concernAggQuery))
      )
    ),
    benefitAggQuery: context.applyPriceFilter(
      context.applyQueryFilter(
        context.applyBrandFilter(context.applyCategoryFilter(bundle.benefitAggQuery))
      )
    ),
  }) as TBundle;
