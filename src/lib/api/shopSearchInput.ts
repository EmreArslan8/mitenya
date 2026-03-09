import { FilterCache } from "../cache/filterCache";
import { ShopSearchOptions } from "./types";

type NormalizedShopSearchInput = {
  selectedCategoryIds: string[];
  selectedBrandIds: string[];
  selectedConcernIds: string[];
  selectedBenefitIds: string[];
  selectedQueryTokens: string[];
};

const sanitizeQueryToken = (token: string) =>
  token
    .trim()
    .replaceAll(",", "\\,")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");

const mapSelectedTokensToIds = (
  tokens: string[],
  slugToId: Record<string, string>
) => tokens.map((token) => slugToId[token] ?? token).filter(Boolean);

export const normalizeShopSearchInput = (
  options: Partial<ShopSearchOptions>,
  filterAggregations: FilterCache
): NormalizedShopSearchInput => {
  const categorySlugToId = Object.fromEntries(
    filterAggregations.categories.map((category) => [category.slug, category.id])
  );
  const brandSlugToId = Object.fromEntries(
    filterAggregations.brands.map((brand) => [brand.slug, brand.id])
  );
  const concernSlugToId = Object.fromEntries(
    (filterAggregations.concerns ?? []).map((concern) => [concern.slug, concern.id])
  );
  const benefitSlugToId = Object.fromEntries(
    (filterAggregations.benefits ?? []).map((benefit) => [benefit.slug, benefit.id])
  );

  const selectedCategoryTokens = options.category?.split(",").filter(Boolean) ?? [];
  const selectedBrandTokens = options.brand?.split(",").filter(Boolean) ?? [];
  const selectedConcernTokens = options.concern?.split(",").filter(Boolean) ?? [];
  const selectedBenefitTokens = options.benefit?.split(",").filter(Boolean) ?? [];

  return {
    selectedCategoryIds: mapSelectedTokensToIds(selectedCategoryTokens, categorySlugToId),
    selectedBrandIds: mapSelectedTokensToIds(selectedBrandTokens, brandSlugToId),
    selectedConcernIds: mapSelectedTokensToIds(selectedConcernTokens, concernSlugToId),
    selectedBenefitIds: mapSelectedTokensToIds(selectedBenefitTokens, benefitSlugToId),
    selectedQueryTokens:
      options.query
        ?.split(/\s+/)
        .map(sanitizeQueryToken)
        .filter(Boolean) ?? [],
  };
};
