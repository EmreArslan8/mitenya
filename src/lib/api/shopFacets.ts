import { FilterCache } from "../cache/filterCache";
import { buildDynamicPriceFilters } from "../shop/priceFilters";
import { ShopFilter } from "./types";

type CategoryAggRow = {
  id: string | null;
  category_id: string | null;
};

type BrandAggRow = {
  id: string | null;
  brand_id: string | null;
};

type BenefitAggRow = {
  id: string | null;
  product_benefits?: { benefit_id: string | null }[] | null;
};

type ConcernAggRow = {
  id: string | null;
  product_concerns?: { concern_id: string | null }[] | null;
};

type PriceAggRow = {
  id: string | null;
  current_price: number | null;
};

type FacetCountsInput = {
  filterAggregations: FilterCache;
  selectedCategoryIds: string[];
  selectedBrandIds: string[];
  selectedBenefitIds: string[];
  selectedConcernIds: string[];
  selectedPrice?: string;
  categoryAggData: CategoryAggRow[] | null | undefined;
  brandAggData: BrandAggRow[] | null | undefined;
  benefitAggData: BenefitAggRow[] | null | undefined;
  concernAggData: ConcernAggRow[] | null | undefined;
  priceAggData: PriceAggRow[] | null | undefined;
};

const buildUniqueCountMap = <TRow, TKey extends string>(
  rows: TRow[] | null | undefined,
  getPairs: (row: TRow) => [TKey | null | undefined, string | null | undefined][]
) => {
  const sets = (rows ?? []).reduce<Record<string, Set<string>>>((acc, row) => {
    for (const [key, productId] of getPairs(row)) {
      if (!key || !productId) continue;
      if (!acc[key]) acc[key] = new Set<string>();
      acc[key].add(productId);
    }
    return acc;
  }, {});

  return Object.fromEntries(
    Object.entries(sets).map(([key, ids]) => [key, ids.size])
  );
};

export const buildShopFacets = ({
  filterAggregations,
  selectedCategoryIds,
  selectedBrandIds,
  selectedBenefitIds,
  selectedConcernIds,
  selectedPrice,
  categoryAggData,
  brandAggData,
  benefitAggData,
  concernAggData,
  priceAggData,
}: FacetCountsInput) => {
  const contextualCategoryCounts = buildUniqueCountMap(
    categoryAggData,
    (row) => [[row.category_id, row.id ? String(row.id) : null]]
  );

  const contextualBrandCounts = buildUniqueCountMap(
    brandAggData,
    (row) => [[row.brand_id, row.id ? String(row.id) : null]]
  );

  const contextualBenefitCounts = buildUniqueCountMap(
    benefitAggData,
    (row) =>
      !row.id || !Array.isArray(row.product_benefits)
        ? []
        : row.product_benefits.map((benefit) => [benefit.benefit_id, String(row.id)])
  );

  const contextualConcernCounts = buildUniqueCountMap(
    concernAggData,
    (row) =>
      !row.id || !Array.isArray(row.product_concerns)
        ? []
        : row.product_concerns.map((concern) => [concern.concern_id, String(row.id)])
  );

  const categoryFilters: ShopFilter<"category">[] = filterAggregations.categories.map((category) => ({
    type: "category" as const,
    text: `${category.name} (${contextualCategoryCounts[category.id] ?? 0})`,
    count: contextualCategoryCounts[category.id] ?? 0,
    searchOptions: { category: category.slug },
    selected: selectedCategoryIds.includes(category.id),
    allowMultiple: true,
  }));

  const brandFilters: ShopFilter<"brand">[] = filterAggregations.brands.map((brand) => ({
    type: "brand" as const,
    text: `${brand.name} (${contextualBrandCounts[brand.id] ?? 0})`,
    count: contextualBrandCounts[brand.id] ?? 0,
    searchOptions: { brand: brand.slug },
    selected: selectedBrandIds.includes(brand.id),
    allowMultiple: true,
  }));

  const benefitFilters: ShopFilter<"benefit">[] = (filterAggregations.benefits ?? [])
    .map((benefit) => ({
      type: "benefit" as const,
      text: `${benefit.name} (${contextualBenefitCounts[benefit.id] ?? 0})`,
      count: contextualBenefitCounts[benefit.id] ?? 0,
      searchOptions: { benefit: benefit.slug },
      selected: selectedBenefitIds.includes(benefit.id),
      allowMultiple: true,
    }))
    .filter((filter) => Boolean(filter.selected) || (filter.count ?? 0) > 0);

  const concernFilters: ShopFilter<"concern">[] = (filterAggregations.concerns ?? [])
    .map((concern) => ({
      type: "concern" as const,
      text: `${concern.name} (${contextualConcernCounts[concern.id] ?? 0})`,
      count: contextualConcernCounts[concern.id] ?? 0,
      searchOptions: { concern: concern.slug },
      selected: selectedConcernIds.includes(concern.id),
      allowMultiple: true,
    }))
    .filter((filter) => Boolean(filter.selected) || (filter.count ?? 0) > 0);

  const contextualPriceByProduct = (priceAggData ?? []).reduce<Record<string, number>>((acc, row) => {
    const productId = row.id ? String(row.id) : "";
    const price = Number(row.current_price);
    if (!productId || !Number.isFinite(price)) return acc;
    if (!(productId in acc)) acc[productId] = price;
    return acc;
  }, {});

  const priceFilters = buildDynamicPriceFilters(
    Object.values(contextualPriceByProduct),
    selectedPrice
  );

  return {
    categoryFilters,
    brandFilters,
    benefitFilters,
    concernFilters,
    priceFilters,
  };
};
