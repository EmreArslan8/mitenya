import { getSupabaseAnon } from "../supabase/anon";
import { getFilterAggregations } from "../cache/filterCache";
import { ShopSearchOptions, ShopSearchSort, ShopProductListItemData, Collection } from "./types";
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from "../constants/shop";
import {
  applyDiscountSortFilters,
  DiscountSortBuilder,
  reorderItemsByIds,
  resolveDiscountSortedPageIds,
} from "../shop/discountSort";
import { buildShopFacets } from "./shopFacets";
import { mapShopProductRow } from "./shopProductMapper";
import { normalizeShopSearchInput } from "./shopSearchInput";
import { resolveScopedProductIds } from "./shopScopes";
import {
  applyProductIdFiltersToBundle,
  applySharedFiltersToBundle,
  createApplyProductIdFilter,
  createApplyCategoryFilter,
  createApplyBrandFilter,
  createApplyQueryFilter,
  createApplyPriceFilter,
} from "./shopQueryFilters";

// Fetch collection by slug
export async function fetchCollectionBySlug(slug: string): Promise<Collection | null> {
  const supabase = getSupabaseAnon();

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as Collection;
}

export async function fetchProductsSupabase(options: Partial<ShopSearchOptions> = {}) {
  const supabase = getSupabaseAnon();
  const filterAggregations = await getFilterAggregations();

  const page = Number(options.page ?? 1);
  const offset = (page - 1) * PRODUCTS_PER_PAGE;

  const sort: ShopSearchSort = (options.sort as ShopSearchSort) ?? "rct";
  const {
    selectedCategoryIds,
    selectedBrandIds,
    selectedConcernIds,
    selectedBenefitIds,
    selectedQueryTokens,
  } = normalizeShopSearchInput(options, filterAggregations);

  const applyProductIdFilter = createApplyProductIdFilter();
  const applyCategoryFilter = createApplyCategoryFilter(selectedCategoryIds);
  const applyBrandFilter = createApplyBrandFilter(selectedBrandIds);
  const applyQueryFilter = createApplyQueryFilter(selectedQueryTokens);
  const applyPriceFilter = createApplyPriceFilter(options.price);

  const emptyResponse = {
    products: [],
    totalCount: 0,
    tq: options.query,
    filters: { selectedOptions: options },
    sortOptions: SORT_OPTIONS,
    session: { _S1: "supabase" },
  };

  const {
    collectionProductIds,
    concernProductIds,
    benefitProductIds,
    hasEmptyScope,
  } = await resolveScopedProductIds({
    supabase,
    collectionSlug: options.collection,
    selectedConcernIds,
    selectedBenefitIds,
  });

  if (hasEmptyScope) {
    return emptyResponse;
  }

  let query = supabase
    .from("products")
    .select(
      `
      id,
      slug,
      name,
      brand_id,
      brand_name,
      category_id,
      category_name,
      current_price,
      original_price,
      currency,
      rating_average,
      rating_count,
      created_at,
      has_variants,
      product_prices!inner(price_current, price_original, currency),
      product_images(image_url, is_main, sort_order)
      , product_stock(quantity)
    `,
      { count: "exact" }
    );

  // Price aggregation query (contextual to current filters except selected price)
  let priceAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      current_price
    `
    );

  // Contextual aggregation queries (for facet counts)
  let categoryAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      category_id
    `
    );

  let brandAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      brand_id
    `
    );

  let concernAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      product_concerns!inner(concern_id)
    `
    );

  let benefitAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      product_benefits!inner(benefit_id)
    `
    );

  let queryBundle = {
    query,
    priceAggQuery,
    categoryAggQuery,
    brandAggQuery,
    concernAggQuery,
    benefitAggQuery,
  };

  queryBundle = applyProductIdFiltersToBundle(queryBundle, collectionProductIds, applyProductIdFilter);
  queryBundle = applyProductIdFiltersToBundle(queryBundle, concernProductIds, applyProductIdFilter);
  queryBundle = applyProductIdFiltersToBundle(queryBundle, benefitProductIds, applyProductIdFilter);

  ({
    query,
    priceAggQuery,
    categoryAggQuery,
    brandAggQuery,
    concernAggQuery,
    benefitAggQuery,
  } = queryBundle);

  query = query.limit(1, { referencedTable: "product_prices" });

  queryBundle = applySharedFiltersToBundle(
    {
      query,
      priceAggQuery,
      categoryAggQuery,
      brandAggQuery,
      concernAggQuery,
      benefitAggQuery,
    },
    {
      applyCategoryFilter,
      applyBrandFilter,
      applyQueryFilter,
      applyPriceFilter,
    }
  );

  ({
    query,
    priceAggQuery,
    categoryAggQuery,
    brandAggQuery,
    concernAggQuery,
    benefitAggQuery,
  } = queryBundle);

  let sortedPageProductIds: string[] | null = null;
  let totalCountOverride: number | null = null;

  if (sort === "disc") {
    const discountBaseQuery =
      supabase
        .from("products")
        .select("id, current_price, original_price") as unknown as DiscountSortBuilder;

    const discountSortQuery = applyDiscountSortFilters(discountBaseQuery, {
      collectionProductIds,
      concernProductIds,
      benefitProductIds,
      applyProductIdFilter,
      applyCategoryFilter,
      applyBrandFilter,
      applyQueryFilter,
      applyPriceFilter,
    });

    const { data: discountSortData, error: discountSortError } = await discountSortQuery;

    if (discountSortError) {
      console.error("[SUPABASE] fetchProductsSupabase discount sort error:", discountSortError);
    } else {
      const discountSortResult = resolveDiscountSortedPageIds(
        discountSortData ?? [],
        offset,
        PRODUCTS_PER_PAGE
      );
      totalCountOverride = discountSortResult.totalCount;
      sortedPageProductIds = discountSortResult.pageIds;
    }
  }

  // sort
  switch (sort) {
    case "asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "dsc":
      query = query.order("created_at", { ascending: false });
      break;
    case "rct":
      query = query.order("created_at", { ascending: false });
      break;
    case "rcc":
      // Proxy for "rating count": highest engagement first.
      query = query
        .order("rating_count", { ascending: false, nullsFirst: false })
        .order("rating_average", { ascending: false, nullsFirst: false });
      break;
    case "fav":
      // No explicit favorites metric in schema; use rating as a proxy.
      query = query
        .order("rating_average", { ascending: false, nullsFirst: false })
        .order("rating_count", { ascending: false, nullsFirst: false });
      break;
    case "bst":
      // No explicit "best seller" metric in schema; use rating_count as a proxy for now.
      query = query.order("rating_count", { ascending: false, nullsFirst: false });
      break;
    case "pasc":
      query = query.order("current_price", { ascending: true, nullsFirst: false });
      break;
    case "pdsc":
      query = query.order("current_price", { ascending: false, nullsFirst: false });
      break;
    case "disc":
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }
  if (sortedPageProductIds) {
    query = query.in("id", sortedPageProductIds);
  } else {
    query = query.range(offset, offset + PRODUCTS_PER_PAGE - 1);
  }

  // Run product query and filter aggregations in parallel
  const [productResult, priceAggResult, categoryAggResult, brandAggResult, concernAggResult, benefitAggResult] = await Promise.all([
    query,
    priceAggQuery,
    categoryAggQuery,
    brandAggQuery,
    concernAggQuery,
    benefitAggQuery,
  ]);

  const { data, error, count } = productResult;
  const { data: priceAggData } = priceAggResult;
  const { data: categoryAggData } = categoryAggResult;
  const { data: brandAggData } = brandAggResult;
  const { data: concernAggData } = concernAggResult;
  const { data: benefitAggData } = benefitAggResult;

  if (error || !data) {
    console.error("[SUPABASE] fetchProductsSupabase error:", error);
    return emptyResponse;
  }

  let products: ShopProductListItemData[] = data.map(mapShopProductRow);

  if (sortedPageProductIds?.length) {
    products = reorderItemsByIds(products, sortedPageProductIds);
  }

  const {
    categoryFilters,
    brandFilters,
    benefitFilters,
    concernFilters,
    priceFilters,
  } = buildShopFacets({
    filterAggregations,
    selectedCategoryIds,
    selectedBrandIds,
    selectedBenefitIds,
    selectedConcernIds,
    selectedPrice: options.price,
    categoryAggData,
    brandAggData,
    benefitAggData,
    concernAggData,
    priceAggData,
  });

  return {
    products,
    totalCount: totalCountOverride ?? count ?? 0,
    tq: options.query,
    filters: {
      selectedOptions: {
        ...options,
      },
      categories: categoryFilters,
      brands: brandFilters,
      benefits: benefitFilters,
      concerns: concernFilters,
      priceRanges: priceFilters,
    },
    sortOptions: SORT_OPTIONS,
    session: { _S1: "supabase" },
  };
}
