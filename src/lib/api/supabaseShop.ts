import { getSupabaseAnon } from "../supabase/anon";
import { getFilterAggregations } from "../cache/filterCache";
import { r2Url } from "../utils/r2";
import { ShopSearchOptions, ShopSearchSort, ShopProductListItemData, ShopFilter } from "./types";
import { PRICE_RANGES, PRODUCTS_PER_PAGE, SORT_OPTIONS } from "../constants/shop";

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

  // Backward compatibility: still accept IDs if old links exist.
  const selectedCategoryIds = selectedCategoryTokens
    .map((token) => categorySlugToId[token] ?? token)
    .filter(Boolean);
  const selectedBrandIds = selectedBrandTokens
    .map((token) => brandSlugToId[token] ?? token)
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

  const applyCollectionFilter = <T extends { in: (column: string, values: string[]) => T }>(
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
      category_id,
      category_name,
      product_prices!inner(price_current)
    `
    );

  let brandAggQuery = supabase
    .from("products")
    .select(
      `
      brand_id,
      brand_name,
      product_prices!inner(price_current)
    `
    );

  query = applyCollectionFilter(query, collectionProductIds);
  priceAggQuery = applyCollectionFilter(priceAggQuery, collectionProductIds);
  categoryAggQuery = applyCollectionFilter(categoryAggQuery, collectionProductIds);
  brandAggQuery = applyCollectionFilter(brandAggQuery, collectionProductIds);

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

  query = applyBrandFilter(query);
  priceAggQuery = applyBrandFilter(priceAggQuery);
  // Keep category counts contextual to selected brands
  categoryAggQuery = applyBrandFilter(categoryAggQuery);

  query = applyQueryFilter(query);
  priceAggQuery = applyQueryFilter(priceAggQuery);
  categoryAggQuery = applyQueryFilter(categoryAggQuery);
  brandAggQuery = applyQueryFilter(brandAggQuery);

  query = applyPriceFilter(query);
  categoryAggQuery = applyPriceFilter(categoryAggQuery);
  brandAggQuery = applyPriceFilter(brandAggQuery);

  // sort
  switch (sort) {
    case "asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "dsc":
      query = query.order("created_at", { ascending: false });
      break;
    case "pasc":
      query = query.order("current_price", { ascending: true });
      break;
    case "pdsc":
      query = query.order("current_price", { ascending: false });
      break;
    case "disc":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Run product query and filter aggregations in parallel
  const [productResult, priceAggResult, categoryAggResult, brandAggResult] = await Promise.all([
    query,
    priceAggQuery,
    categoryAggQuery,
    brandAggQuery,
  ]);

  const { data, error, count } = productResult;
  const { data: priceAggData } = priceAggResult;
  const { data: categoryAggData } = categoryAggResult;
  const { data: brandAggData } = brandAggResult;

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
  const contextualCategoryCounts = (categoryAggData ?? []).reduce<Record<string, number>>((acc, row) => {
    if (!row.category_id) return acc;
    acc[row.category_id] = (acc[row.category_id] ?? 0) + 1;
    return acc;
  }, {});

  const contextualBrandCounts = (brandAggData ?? []).reduce<Record<string, number>>((acc, row) => {
    if (!row.brand_id) return acc;
    acc[row.brand_id] = (acc[row.brand_id] ?? 0) + 1;
    return acc;
  }, {});

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

  const contextualPrices =
    priceAggData
      ?.map((row) => Number(row.product_prices?.[0]?.price_current))
      .filter((price) => Number.isFinite(price)) ?? [];

  const priceFilters: ShopFilter<'price'>[] = PRICE_RANGES.map((range) => {
    const countInRange = contextualPrices.filter(
      (price) => price >= range.min && price < range.max
    ).length;
    return {
    type: "price" as const,
    text: `${range.label} (${countInRange})`,
    count: countInRange,
    searchOptions: {
      price: `${range.min}-${range.max === Infinity ? "" : range.max}`,
    },
    selected: options.price === `${range.min}-${range.max === Infinity ? "" : range.max}`,
    allowMultiple: false,
  };
  });

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
      priceRanges: priceFilters,
    },
    sortOptions: SORT_OPTIONS,
    session: { _S1: "supabase" },
  };
}
