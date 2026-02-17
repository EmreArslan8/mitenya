import { supabaseAdmin } from "../supabase/admin";
import { r2Url } from "../utils/r2"; 
import { getFilterAggregations } from "../cache/filterCache";

const DEFAULT_FAQ_LOCALE = "tr-TR";

type ProductFaqRow = {
  question: string;
  answer: string;
  sort_order?: number | null;
};

async function loadProductFaqs(
  productId: string
): Promise<{ rows: ProductFaqRow[]; usedLegacyQuery: boolean }> {
  const supabase = supabaseAdmin;

  const scopedFaqQuery = await supabase
    .from("product_faqs")
    .select("question, answer, sort_order, scope, is_active, locale")
    .eq("is_active", true)
    .eq("locale", DEFAULT_FAQ_LOCALE)
    .or(`product_id.eq.${productId},scope.eq.global`)
    .order("sort_order", { ascending: true });

  if (!scopedFaqQuery.error) {
    const scopedRows = (scopedFaqQuery.data ?? []) as Array<
      ProductFaqRow & { scope?: string | null }
    >;
    const rows = scopedRows
      .filter((row) => row.question?.trim() && row.answer?.trim())
      .sort((a, b) => {
        const orderDiff = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
        if (orderDiff !== 0) return orderDiff;
        const aScopeWeight = a.scope === "global" ? 0 : 1;
        const bScopeWeight = b.scope === "global" ? 0 : 1;
        return aScopeWeight - bScopeWeight;
      })
      .map(({ question, answer, sort_order }) => ({ question, answer, sort_order }));

    return { rows, usedLegacyQuery: false };
  }

  const legacyFaqQuery = await supabase
    .from("product_faqs")
    .select("question, answer, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (legacyFaqQuery.error) {
    return { rows: [], usedLegacyQuery: true };
  }

  const rows = (legacyFaqQuery.data ?? []).filter(
    (row) => row.question?.trim() && row.answer?.trim()
  ) as ProductFaqRow[];

  return { rows, usedLegacyQuery: true };
}

export async function fetchProductDataSupabase(idOrSlug: string) {
  const supabase = supabaseAdmin;

  const selectQuery = `
      id,
      slug,
      name,
      brand_id,
      brand_name,
      category_id,
      category_name,
      rating_average,
      rating_count,
      description,
      current_price,
      original_price,
      currency,
      product_prices(price_current, price_original, currency),
      product_images(image_path, image_url, is_main, sort_order),
      product_stock(quantity),
      attributes_json,
      meta_title,
      meta_description,
      meta_keywords
    `;

  let { data, error } = await supabase
    .from("products")
    .select(selectQuery)
    .eq("slug", idOrSlug)
    .single();

  // Slug ile bulunamadıysa id ile dene (geriye uyumluluk)
  if (error || !data) {
    const result = await supabase
      .from("products")
      .select(selectQuery)
      .eq("id", idOrSlug)
      .single();

    data = result.data;
    error = result.error;
  }

  if (error || !data) {
    return null;
  }

  const readStockQuantity = (row: unknown): number => {
    if (typeof row !== "object" || row === null) return 0;
    const quantity = (row as { quantity?: unknown }).quantity;
    return Number(quantity ?? 0);
  };

  const rawStockRows = Array.isArray(data.product_stock) ? data.product_stock : [];
  const firstStockQuantity = readStockQuantity(rawStockRows[0]);

  // const { data: reviewRows } = await supabase
  //   .from("product_reviews")
  //   .select("id, user_name, rating, text, created_at")
  //   .eq("product_id", String(data.id))
  //   .order("created_at", { ascending: false });

  // const reviews =
  //   reviewRows?.map((r: any) => ({
  //     id: r.id,
  //     name: r.user_name ?? undefined,
  //     rating: typeof r.rating === "number" ? r.rating : undefined,
  //     text: r.text,
  //     date: r.created_at,
  //   })) ?? [];

  // const computedRating =
  //   reviews.length > 0
  //     ? {
  //         averageRating:
  //           Math.round(
  //             (reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length) * 100
  //           ) / 100,
  //         totalCount: reviews.length,
  //       }
  //     : undefined;

  const { rows: faqRows } = await loadProductFaqs(String(data.id));

  const priceRow = data.product_prices?.[0];
  const price = priceRow ?? {
    price_current: data.current_price,
    price_original: data.original_price,
    currency: data.currency,
  };

  const imagesSorted = [...(data.product_images ?? [])].sort(
    (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  // 🔹 R2 entegrasyonu: image_path varsa onu, yoksa image_url kullan
  const imageUrls: string[] = imagesSorted.map((i: any) => {
    const pathOrUrl = i.image_path || i.image_url || "";
    return r2Url(pathOrUrl);
  });

  const imgSrc = imageUrls[0] ?? "";

  const attributes = data.attributes_json 
  ? (data.attributes_json as any[]) 
  : [];

  const filterAggregations = await getFilterAggregations();
  const brandSlug = filterAggregations.brands.find((b) => b.id === data.brand_id)?.slug;
  const categorySlug = filterAggregations.categories.find((c) => c.id === data.category_id)?.slug;

  return {
    id: data.id,
    brand: data.brand_name,
    brandId: data.brand_id,
    brandSlug,
    name: data.name,
    category: data.category_name,
    categoryId: data.category_id,
    categorySlug,
    url: `/product/${data.slug || data.id}`,
    images: imageUrls,
    imgSrc,
    description: data.description ?? "",
    price: {
      currentPrice: Number(price.price_current) || 0,
      originalPrice: Number(price.price_original) || Number(price.price_current) || 0,
      currency: price.currency || "TRY",
    },
    quantity: firstStockQuantity,
    attributes: attributes,
    reviews: [],
    faqs: faqRows ?? [],
    rating:
      data.rating_count > 0
        ? {
            averageRating: Number(data.rating_average) || 0,
            totalCount: Number(data.rating_count) || 0,
          }
        : undefined,
    metaTitle: data.meta_title ?? null,
    metaDescription: data.meta_description ?? null,
    metaKeywords: data.meta_keywords ?? null,
  };
}
