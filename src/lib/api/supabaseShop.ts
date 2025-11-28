import { supabase } from "../supabase/client";
import { r2Url } from "../utils/r2";
import { ShopSearchOptions, ShopSearchSort, ShopProductListItemData } from "./types";

export async function fetchProductsSupabase(options: Partial<ShopSearchOptions> = {}) {
 // console.log("🟦 [SUPABASE] fetchProductsSupabase options:", options);

  const page = Number(options.page ?? 1);
  const limit = 24;
  const offset = (page - 1) * limit;

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
      product_prices(price_current, price_original, currency),
      product_images(image_url, is_main, sort_order)
    `,
      { count: "exact" }
    )
    .range(offset, offset + limit - 1);

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
      // infinite max
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
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const SORT_OPTIONS: ShopSearchSort[] = ["rct", "asc", "dsc"];
 
  const { data, error, count } = await query;
  console.log("🟩 [SUPABASE] Raw supabase response:", data, "count:", count);

  if (error || !data) {
    console.log("❌ [SUPABASE] error:", error);
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
      const mainImage = imagesSorted[0];
    return {
      id: p.id,
      brand: p.brand_name,
      brandId: p.brand_id,
      category: p.category_name,
      name: p.name,
      url: `/product/${p.id}`,
      images: imagesSorted.map((im) => ({
        url: r2Url(im.image_url)
      })),
    
      imgSrc: r2Url(imagesSorted[0]?.image_url ?? ""),
      price: {
        currentPrice: Number(priceRow?.price_current ?? 0),
        originalPrice: Number(priceRow?.price_original ?? priceRow?.price_current ?? 0),
        currency: priceRow?.currency ?? "TRY",
      },
      rating:
        p.rating_count > 0
          ? {
              averageRating: Number(p.rating_average) || 0,
              totalCount: Number(p.rating_count) || 0,
            }
          : undefined,
    };
  });

  console.log("🟪 [SUPABASE] Mapped products:", products.length);

  // ============================================================
  // 🎯 CATEGORY FILTERS
  // ============================================================
  const categoryAgg = await supabase.from("products").select("category_id, category_name");

  let categoryFilters: any[] = [];
  if (categoryAgg.data) {
    const grouped = Object.values(
      categoryAgg.data.reduce((acc: any, row: any) => {
        if (!acc[row.category_id]) {
          acc[row.category_id] = {
            id: row.category_id,
            name: row.category_name,
            count: 0,
          };
        }
        acc[row.category_id].count += 1;
        return acc;
      }, {})
    );

    categoryFilters = grouped.map((c: any) => ({
      type: "category",
      text: `${c.name} (${c.count})`,
      searchOptions: { category: c.id },
      selected: selectedCategoryIds.includes(c.id),
      allowMultiple: true,
    }));
  }

  // ============================================================
  // 🎯 BRAND FILTERS
  // ============================================================
  const brandAgg = await supabase.from("products").select("brand_id, brand_name");

  let brandFilters: any[] = [];
  if (brandAgg.data) {
    const groupedBrands = Object.values(
      brandAgg.data.reduce((acc: any, row: any) => {
        if (!acc[row.brand_id]) {
          acc[row.brand_id] = {
            id: row.brand_id,
            name: row.brand_name,
            count: 0,
          };
        }
        acc[row.brand_id].count += 1;
        return acc;
      }, {})
    );

    brandFilters = groupedBrands.map((b: any) => ({
      type: "brand",
      text: `${b.name} (${b.count})`,
      searchOptions: { brand: b.id },
      selected: selectedBrandIds.includes(b.id),
      allowMultiple: true,
    }));
  }

  // ============================================================
  // 🎯 PRICE RANGE FILTERS
  // ============================================================
  const priceData = await supabase.from("product_prices").select("price_current");

  let priceFilters: any[] = [];
  if (priceData.data) {
    const prices = priceData.data.map((p) => Number(p.price_current));

    const ranges = [
      { label: "0 - 250 TL", min: 0, max: 250 },
      { label: "250 - 500 TL", min: 250, max: 500 },
      { label: "500 - 750 TL", min: 500, max: 750 },
      { label: "750 - 1000 TL", min: 750, max: 1000 },
      { label: "1000 TL ve üzeri", min: 1000, max: Infinity },
    ];

    priceFilters = ranges.map((r) => {
      const count = prices.filter((p) => p >= r.min && p < r.max).length;

      return {
        type: "price",
        text: `${r.label} (${count})`,
        searchOptions: {
          price: `${r.min}-${r.max === Infinity ? "" : r.max}`,
        },
        selected: options.price === `${r.min}-${r.max === Infinity ? "" : r.max}`,
        allowMultiple: false,
      };
    });
  }

  // ============================================================
  // 🎇 FINAL RETURN
  // ============================================================

  return {
    products,
    totalCount: count ?? 0,
    tq: options.query,
    filters: {
      selectedOptions: options,
      categories: categoryFilters,
      brands: brandFilters,
      priceRanges: priceFilters, // 👈 FİYAT FİLTRESİ EKLENDİ
    },
    sortOptions: SORT_OPTIONS,
    session: { _S1: "supabase" },
  };
}
