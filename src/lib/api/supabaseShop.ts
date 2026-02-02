import { getSupabaseAnon } from "../supabase/anon";
import { getFilterAggregations } from "../cache/filterCache";
import { r2Url } from "../utils/r2";
import { ShopSearchOptions, ShopSearchSort, ShopProductListItemData, ShopFilter } from "./types";
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from "../constants/shop";

export async function fetchProductsSupabase(options: Partial<ShopSearchOptions> = {}) {
  const supabase = getSupabaseAnon();

  const page = Number(options.page ?? 1);
  const offset = (page - 1) * PRODUCTS_PER_PAGE;

  const sort: ShopSearchSort = (options.sort as ShopSearchSort) ?? "rct";

  const selectedBrandIds = options.brand?.split(",").filter(Boolean) ?? [];
  const selectedCategoryIds = options.category?.split(",").filter(Boolean) ?? [];

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
      product_prices(price_current, price_original, currency),
      product_images(image_url, is_main, sort_order)
    `,
      { count: "exact" }
    )
    .range(offset, offset + PRODUCTS_PER_PAGE - 1);

  // Always pick a single price row per product (lowest current price)
  query = query
    .order("price_current", { ascending: true, foreignTable: "product_prices" })
    .limit(1, { foreignTable: "product_prices" });

  // category filter
  if (selectedCategoryIds.length) query = query.in("category_id", selectedCategoryIds);

  // brand filter
  if (selectedBrandIds.length) query = query.in("brand_id", selectedBrandIds);

  // query search
  if (options.query) query = query.ilike("name", `%${options.query}%`);

  // price filter (min-max)
  if (options.price) {
    const [minStr, maxStr] = options.price.split("-");
    const min = Number(minStr);
    const max = maxStr ? Number(maxStr) : null;

    if (max) {
      query = query.gte("product_prices.price_current", min).lte("product_prices.price_current", max);
    } else {
      query = query.gte("product_prices.price_current", min);
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
  const [productResult, filterAggregations] = await Promise.all([
    query,
    getFilterAggregations(),
  ]);

  const { data, error, count } = productResult;

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
  const categoryFilters: ShopFilter<'category'>[] = filterAggregations.categories.map((c) => ({
    type: "category" as const,
    text: `${c.name} (${c.count})`,
    searchOptions: { category: c.id },
    selected: selectedCategoryIds.includes(c.id),
    allowMultiple: true,
  }));

  const brandFilters: ShopFilter<'brand'>[] = filterAggregations.brands.map((b) => ({
    type: "brand" as const,
    text: `${b.name} (${b.count})`,
    searchOptions: { brand: b.id },
    selected: selectedBrandIds.includes(b.id),
    allowMultiple: true,
  }));

  const priceFilters: ShopFilter<'price'>[] = filterAggregations.priceRanges.map((r) => ({
    type: "price" as const,
    text: `${r.label} (${r.count})`,
    searchOptions: {
      price: `${r.min}-${r.max === Infinity ? "" : r.max}`,
    },
    selected: options.price === `${r.min}-${r.max === Infinity ? "" : r.max}`,
    allowMultiple: false,
  }));

  return {
    products,
    totalCount: count ?? 0,
    tq: options.query,
    filters: {
      selectedOptions: options,
      categories: categoryFilters,
      brands: brandFilters,
      priceRanges: priceFilters,
    },
    sortOptions: SORT_OPTIONS,
    session: { _S1: "supabase" },
  };
}
