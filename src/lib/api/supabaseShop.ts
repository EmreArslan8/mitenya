import { getSupabaseAnon } from "../supabase/anon";
import { getFilterAggregations } from "../cache/filterCache";
import { r2Url } from "../utils/r2";
import { ShopSearchOptions, ShopSearchSort, ShopProductListItemData, ShopFilter } from "./types";
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from "../constants/shop";

const parsePriceToken = (token?: string) => {
  if (!token) return null;
  const [minStr, maxStr] = token.split("-");
  const min = Number(minStr);
  const max = maxStr ? Number(maxStr) : null;
  if (!Number.isFinite(min)) return null;
  if (max !== null && !Number.isFinite(max)) return null;
  if (max !== null && max < min) return null;
  return { min, max };
};

const percentile = (sortedValues: number[], p: number) => {
  if (!sortedValues.length) return 0;
  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
};

const getRoundingStep = (value: number) => {
  if (value <= 500) return 50;
  if (value <= 2000) return 100;
  if (value <= 5000) return 250;
  return 500;
};

const roundToStep = (value: number, step: number) => Math.ceil(value / step) * step;
const TAIL_CEILING_FACTOR = 1.25;

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
    const token = `${range.min}-${range.max === null ? "" : range.max}`;
    const countInRange = contextualPrices.filter((price) =>
      range.max === null ? price >= range.min : price >= range.min && price < range.max
    ).length;
    const label = range.max === null ? `${range.min} TL ve üzeri` : `${range.min} - ${range.max} TL`;

    return {
      type: "price" as const,
      text: `${label} (${countInRange})`,
      count: countInRange,
      searchOptions: { price: token },
      selected: selectedPriceToken === token,
      allowMultiple: false,
    };
  });

  const hasSelectedOption = built.some((filter) => filter.selected);
  if (!hasSelectedOption && selectedPrice) {
    const selectedToken = `${selectedPrice.min}-${selectedPrice.max === null ? "" : selectedPrice.max}`;
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
      type: "price" as const,
      text: `${selectedLabel} (${selectedCount})`,
      count: selectedCount,
      searchOptions: { price: selectedToken },
      selected: true,
      allowMultiple: false,
    });
  }

  return built;
};

// Collection type
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_image: string | null;
  is_active: boolean;
  sort_order: number;
}

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
  const categorySlugToId = Object.fromEntries(
    filterAggregations.categories.map((category) => [category.slug, category.id])
  );
  const brandSlugToId = Object.fromEntries(
    filterAggregations.brands.map((brand) => [brand.slug, brand.id])
  );

  const selectedCategoryTokens = options.category?.split(",").filter(Boolean) ?? [];
  const selectedBrandTokens = options.brand?.split(",").filter(Boolean) ?? [];
  const selectedConcernTokens = options.concern?.split(",").filter(Boolean) ?? [];
  const selectedBenefitTokens = options.benefit?.split(",").filter(Boolean) ?? [];

  // Backward compatibility: still accept IDs if old links exist.
  const selectedCategoryIds = selectedCategoryTokens
    .map((token) => categorySlugToId[token] ?? token)
    .filter(Boolean);
  const selectedBrandIds = selectedBrandTokens
    .map((token) => brandSlugToId[token] ?? token)
    .filter(Boolean);
  const concernSlugToId = Object.fromEntries(
    (filterAggregations.concerns ?? []).map((concern) => [concern.slug, concern.id])
  );
  const selectedConcernIds = selectedConcernTokens
    .map((token) => concernSlugToId[token] ?? token)
    .filter(Boolean);
  const benefitSlugToId = Object.fromEntries(
    (filterAggregations.benefits ?? []).map((benefit) => [benefit.slug, benefit.id])
  );
  const selectedBenefitIds = selectedBenefitTokens
    .map((token) => benefitSlugToId[token] ?? token)
    .filter(Boolean);

  const sanitizeQueryToken = (token: string) =>
    token
      .trim()
      .replaceAll(",", "\\,")
      .replaceAll("%", "\\%")
      .replaceAll("_", "\\_");

  const selectedQueryTokens = options.query
    ?.split(/\s+/)
    .map(sanitizeQueryToken)
    .filter(Boolean) ?? [];

  const applyProductIdFilter = <T extends { in: (column: string, values: string[]) => T }>(
    builder: T,
    productIds: string[] | null
  ): T => (productIds ? builder.in("id", productIds) : builder);

  const applyCategoryFilter = <T extends { in: (column: string, values: string[]) => T }>(
    builder: T
  ): T => (selectedCategoryIds.length ? builder.in("category_id", selectedCategoryIds) : builder);

  const applyBrandFilter = <T extends { in: (column: string, values: string[]) => T }>(
    builder: T
  ): T => (selectedBrandIds.length ? builder.in("brand_id", selectedBrandIds) : builder);

  const applyQueryFilter = <T extends { or: (filters: string) => T }>(builder: T): T => {
    let nextBuilder = builder;
    for (const token of selectedQueryTokens) {
      nextBuilder = nextBuilder.or(
        `name.ilike.%${token}%,brand_name.ilike.%${token}%,category_name.ilike.%${token}%`
      );
    }
    return nextBuilder;
  };

  const applyPriceFilter = <
    T extends {
      gte: (column: string, value: number) => T;
      lte: (column: string, value: number) => T;
    },
  >(
    builder: T
  ): T => {
    if (!options.price) return builder;
    const [minStr, maxStr] = options.price.split("-");
    const min = Number(minStr);
    const max = maxStr ? Number(maxStr) : null;
    if (!Number.isFinite(min)) return builder;
    if (max && Number.isFinite(max))
      return builder.gte("product_prices.price_current", min).lte("product_prices.price_current", max);
    return builder.gte("product_prices.price_current", min);
  };

  // ---------------------------------------------------
  // COLLECTION FILTER - Get product IDs first if collection is specified
  // ---------------------------------------------------
  let collectionProductIds: string[] | null = null;

  if (options.collection) {
    const { data: collectionData } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", options.collection)
      .eq("is_active", true)
      .single();

    if (collectionData) {
      const { data: productCollections } = await supabase
        .from("product_collections")
        .select("product_id")
        .eq("collection_id", collectionData.id)
        .order("sort_order", { ascending: true });

      collectionProductIds = productCollections?.map((pc) => pc.product_id) ?? [];

      if (collectionProductIds.length === 0) {
        return {
          products: [],
          totalCount: 0,
          tq: options.query,
          filters: { selectedOptions: options },
          sortOptions: SORT_OPTIONS,
          session: { _S1: "supabase" },
        };
      }
    }
  }

  let concernProductIds: string[] | null = null;
  if (selectedConcernIds.length > 0) {
    const { data: productConcerns } = await supabase
      .from("product_concerns")
      .select("product_id")
      .in("concern_id", selectedConcernIds);

    const concernIds = Array.from(
      new Set((productConcerns ?? []).map((row) => String(row.product_id)).filter(Boolean))
    );
    concernProductIds = concernIds;

    if (concernProductIds.length === 0) {
      return {
        products: [],
        totalCount: 0,
        tq: options.query,
        filters: { selectedOptions: options },
        sortOptions: SORT_OPTIONS,
        session: { _S1: "supabase" },
      };
    }
  }

  let benefitProductIds: string[] | null = null;
  if (selectedBenefitIds.length > 0) {
    const { data: productBenefits } = await supabase
      .from("product_benefits")
      .select("product_id")
      .in("benefit_id", selectedBenefitIds);

    const benefitIds = Array.from(
      new Set((productBenefits ?? []).map((row) => String(row.product_id)).filter(Boolean))
    );
    benefitProductIds = benefitIds;

    if (benefitProductIds.length === 0) {
      return {
        products: [],
        totalCount: 0,
        tq: options.query,
        filters: { selectedOptions: options },
        sortOptions: SORT_OPTIONS,
        session: { _S1: "supabase" },
      };
    }
  }

  // ---------------------------------------------------
  // MAIN PRODUCT QUERY
  // ---------------------------------------------------
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
      rating_average,
      rating_count,
      created_at,
      has_variants,
      product_prices!inner(price_current, price_original, currency),
      product_images(image_url, is_main, sort_order)
      , product_stock(quantity)
    `,
      { count: "exact" }
    )
    .range(offset, offset + PRODUCTS_PER_PAGE - 1);

  // Price aggregation query (contextual to current filters except selected price)
  let priceAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      product_prices!inner(price_current)
    `
    );

  // Contextual aggregation queries (for facet counts)
  let categoryAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      category_id,
      category_name,
      product_prices!inner(price_current)
    `
    );

  let brandAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      brand_id,
      brand_name,
      product_prices!inner(price_current)
    `
    );

  let concernAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      product_concerns!inner(concern_id),
      product_prices!inner(price_current)
    `
    );

  let benefitAggQuery = supabase
    .from("products")
    .select(
      `
      id,
      product_benefits!inner(benefit_id),
      product_prices!inner(price_current)
    `
    );

  query = applyProductIdFilter(query, collectionProductIds);
  priceAggQuery = applyProductIdFilter(priceAggQuery, collectionProductIds);
  categoryAggQuery = applyProductIdFilter(categoryAggQuery, collectionProductIds);
  brandAggQuery = applyProductIdFilter(brandAggQuery, collectionProductIds);
  concernAggQuery = applyProductIdFilter(concernAggQuery, collectionProductIds);
  benefitAggQuery = applyProductIdFilter(benefitAggQuery, collectionProductIds);

  query = applyProductIdFilter(query, concernProductIds);
  priceAggQuery = applyProductIdFilter(priceAggQuery, concernProductIds);
  categoryAggQuery = applyProductIdFilter(categoryAggQuery, concernProductIds);
  brandAggQuery = applyProductIdFilter(brandAggQuery, concernProductIds);
  concernAggQuery = applyProductIdFilter(concernAggQuery, concernProductIds);
  benefitAggQuery = applyProductIdFilter(benefitAggQuery, concernProductIds);

  query = applyProductIdFilter(query, benefitProductIds);
  priceAggQuery = applyProductIdFilter(priceAggQuery, benefitProductIds);
  categoryAggQuery = applyProductIdFilter(categoryAggQuery, benefitProductIds);
  brandAggQuery = applyProductIdFilter(brandAggQuery, benefitProductIds);
  concernAggQuery = applyProductIdFilter(concernAggQuery, benefitProductIds);
  benefitAggQuery = applyProductIdFilter(benefitAggQuery, benefitProductIds);

  // Keep a single related price row to avoid duplicate product rows.
  query = query.limit(1, { foreignTable: "product_prices" });

  priceAggQuery = priceAggQuery
    .order("price_current", { ascending: true, foreignTable: "product_prices" })
    .limit(1, { foreignTable: "product_prices" });

  categoryAggQuery = categoryAggQuery
    .order("price_current", { ascending: true, foreignTable: "product_prices" })
    .limit(1, { foreignTable: "product_prices" });

  brandAggQuery = brandAggQuery
    .order("price_current", { ascending: true, foreignTable: "product_prices" })
    .limit(1, { foreignTable: "product_prices" });

  query = applyCategoryFilter(query);
  priceAggQuery = applyCategoryFilter(priceAggQuery);
  // Keep brand counts contextual to selected categories
  brandAggQuery = applyCategoryFilter(brandAggQuery);
  concernAggQuery = applyCategoryFilter(concernAggQuery);
  benefitAggQuery = applyCategoryFilter(benefitAggQuery);

  query = applyBrandFilter(query);
  priceAggQuery = applyBrandFilter(priceAggQuery);
  // Keep category counts contextual to selected brands
  categoryAggQuery = applyBrandFilter(categoryAggQuery);
  concernAggQuery = applyBrandFilter(concernAggQuery);
  benefitAggQuery = applyBrandFilter(benefitAggQuery);

  query = applyQueryFilter(query);
  priceAggQuery = applyQueryFilter(priceAggQuery);
  categoryAggQuery = applyQueryFilter(categoryAggQuery);
  brandAggQuery = applyQueryFilter(brandAggQuery);
  concernAggQuery = applyQueryFilter(concernAggQuery);
  benefitAggQuery = applyQueryFilter(benefitAggQuery);

  query = applyPriceFilter(query);
  categoryAggQuery = applyPriceFilter(categoryAggQuery);
  brandAggQuery = applyPriceFilter(brandAggQuery);
  concernAggQuery = applyPriceFilter(concernAggQuery);
  benefitAggQuery = applyPriceFilter(benefitAggQuery);

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
      query = query.order("price_current", { ascending: true, foreignTable: "product_prices" });
      break;
    case "pdsc":
      query = query.order("price_current", { ascending: false, foreignTable: "product_prices" });
      break;
    case "disc":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
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
    return {
      products: [],
      totalCount: 0,
      tq: options.query,
      filters: { selectedOptions: options },
      sortOptions: SORT_OPTIONS,
      session: { _S1: "supabase" },
    };
  }

  // ---------------------------------------------------
  // MAP PRODUCTS
  // ---------------------------------------------------
  const products: ShopProductListItemData[] = data.map((p) => {
    const priceRow = p.product_prices?.[0];
    const imagesSorted = [...(p.product_images ?? [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );

    return {
      id: p.id,
      brand: p.brand_name,
      brandId: p.brand_id,
      category: p.category_name,
      name: p.name,
      url: `/product/${p.slug || p.id}`,
      createdAt: p.created_at ?? undefined,
      images: imagesSorted.map((im) => ({
        url: r2Url(im.image_url),
      })),
      imgSrc: r2Url(imagesSorted[0]?.image_url ?? ""),
      price: {
        currentPrice: Number(priceRow?.price_current ?? 0),
        originalPrice: Number(priceRow?.price_original ?? priceRow?.price_current ?? 0),
        currency: priceRow?.currency ?? "TRY",
      },
      hasVariant: p.has_variants ?? false,
      quantity: p.product_stock?.[0]?.quantity,
      rating:
        p.rating_count > 0
          ? {
              averageRating: Number(p.rating_average) || 0,
              totalCount: Number(p.rating_count) || 0,
            }
          : undefined,
    };
  });

  if (sort === "disc") {
    products.sort((a, b) => {
      const aOriginal = a.price?.originalPrice ?? 0;
      const bOriginal = b.price?.originalPrice ?? 0;
      const aCurrent = a.price?.currentPrice ?? 0;
      const bCurrent = b.price?.currentPrice ?? 0;
      const aDiscount = aOriginal > aCurrent ? aOriginal - aCurrent : 0;
      const bDiscount = bOriginal > bCurrent ? bOriginal - bCurrent : 0;
      return bDiscount - aDiscount;
    });
  }
  // ---------------------------------------------------
  // BUILD FILTERS FROM CACHE
  // ---------------------------------------------------
  const contextualCategorySets = (categoryAggData ?? []).reduce<Record<string, Set<string>>>((acc, row) => {
    if (!row.category_id || !row.id) return acc;
    if (!acc[row.category_id]) acc[row.category_id] = new Set<string>();
    acc[row.category_id].add(String(row.id));
    return acc;
  }, {});
  const contextualCategoryCounts = Object.fromEntries(
    Object.entries(contextualCategorySets).map(([categoryId, ids]) => [categoryId, ids.size])
  );

  const contextualBrandSets = (brandAggData ?? []).reduce<Record<string, Set<string>>>((acc, row) => {
    if (!row.brand_id || !row.id) return acc;
    if (!acc[row.brand_id]) acc[row.brand_id] = new Set<string>();
    acc[row.brand_id].add(String(row.id));
    return acc;
  }, {});
  const contextualBrandCounts = Object.fromEntries(
    Object.entries(contextualBrandSets).map(([brandId, ids]) => [brandId, ids.size])
  );

  const categoryFilters: ShopFilter<'category'>[] = filterAggregations.categories.map((c) => ({
    type: "category" as const,
    text: `${c.name} (${contextualCategoryCounts[c.id] ?? 0})`,
    count: contextualCategoryCounts[c.id] ?? 0,
    searchOptions: { category: c.slug },
    selected: selectedCategoryIds.includes(c.id),
    allowMultiple: true,
  }));

  const brandFilters: ShopFilter<'brand'>[] = filterAggregations.brands.map((b) => ({
    type: "brand" as const,
    text: `${b.name} (${contextualBrandCounts[b.id] ?? 0})`,
    count: contextualBrandCounts[b.id] ?? 0,
    searchOptions: { brand: b.slug },
    selected: selectedBrandIds.includes(b.id),
    allowMultiple: true,
  }));

  const contextualBenefitSets = (benefitAggData ?? []).reduce<Record<string, Set<string>>>((acc, row) => {
    if (!row.id || !Array.isArray(row.product_benefits)) return acc;
    row.product_benefits.forEach((pb) => {
      if (!pb.benefit_id) return;
      if (!acc[pb.benefit_id]) acc[pb.benefit_id] = new Set<string>();
      acc[pb.benefit_id].add(String(row.id));
    });
    return acc;
  }, {});
  const contextualBenefitCounts = Object.fromEntries(
    Object.entries(contextualBenefitSets).map(([benefitId, ids]) => [benefitId, ids.size])
  );

  const benefitFilters: ShopFilter<'benefit'>[] = (filterAggregations.benefits ?? [])
    .map((b) => ({
      type: "benefit" as const,
      text: `${b.name} (${contextualBenefitCounts[b.id] ?? 0})`,
      count: contextualBenefitCounts[b.id] ?? 0,
      searchOptions: { benefit: b.slug },
      selected: selectedBenefitIds.includes(b.id),
      allowMultiple: true,
    }))
    .filter((f) => Boolean(f.selected) || (f.count ?? 0) > 0);

  const contextualConcernSets = (concernAggData ?? []).reduce<Record<string, Set<string>>>((acc, row) => {
    if (!row.id || !Array.isArray(row.product_concerns)) return acc;
    row.product_concerns.forEach((pc) => {
      if (!pc.concern_id) return;
      if (!acc[pc.concern_id]) acc[pc.concern_id] = new Set<string>();
      acc[pc.concern_id].add(String(row.id));
    });
    return acc;
  }, {});
  const contextualConcernCounts = Object.fromEntries(
    Object.entries(contextualConcernSets).map(([concernId, ids]) => [concernId, ids.size])
  );

  const concernFilters: ShopFilter<'concern'>[] = (filterAggregations.concerns ?? [])
    .map((c) => ({
      type: "concern" as const,
      text: `${c.name} (${contextualConcernCounts[c.id] ?? 0})`,
      count: contextualConcernCounts[c.id] ?? 0,
      searchOptions: { concern: c.slug },
      selected: selectedConcernIds.includes(c.id),
      allowMultiple: true,
    }))
    .filter((f) => Boolean(f.selected) || (f.count ?? 0) > 0);

  const contextualPriceByProduct = (priceAggData ?? []).reduce<Record<string, number>>((acc, row) => {
    const productId = row.id ? String(row.id) : '';
    const price = Number(row.product_prices?.[0]?.price_current);
    if (!productId || !Number.isFinite(price)) return acc;
    if (!(productId in acc)) acc[productId] = price;
    return acc;
  }, {});
  const contextualPrices = Object.values(contextualPriceByProduct);
  const priceFilters = buildDynamicPriceFilters(contextualPrices, options.price);

  return {
    products,
    totalCount: count ?? 0,
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
