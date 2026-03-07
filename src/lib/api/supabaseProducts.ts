import { supabaseAdmin } from "../supabase/admin";
import { r2Url } from "../utils/r2"; 
import { getFilterAggregations } from "../cache/filterCache";
import type { ShopProductData } from "./types";

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
        // product-specific önce (1), global sonra (0) → descending
        const aScopeWeight = a.scope === "global" ? 0 : 1;
        const bScopeWeight = b.scope === "global" ? 0 : 1;
        return bScopeWeight - aScopeWeight;
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

export async function fetchProductDataSupabase(idOrSlug: string): Promise<ShopProductData | null> {
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
      short_description,
      current_price,
      original_price,
      currency,
      product_prices(price_current, price_original, currency),
      product_images(image_path, image_url, is_main, sort_order),
      product_stock(quantity, stock_status),
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

  const readStockStatus = (row: unknown): "in_stock" | "low_stock" | "out_of_stock" | undefined => {
    if (typeof row !== "object" || row === null) return undefined;
    const status = (row as { stock_status?: unknown }).stock_status;
    if (status === "in_stock" || status === "low_stock" || status === "out_of_stock") {
      return status;
    }
    return undefined;
  };

  const rawStockRows = Array.isArray(data.product_stock) ? data.product_stock : [];
  const firstStockQuantity = readStockQuantity(rawStockRows[0]);
  const firstStockStatus = readStockStatus(rawStockRows[0]);

  const { data: reviewRows, error: reviewError } = await supabase
    .from("product_reviews")
    .select("id, user_name, rating, text, title, verified, created_at")
    .eq("product_id", String(data.id))
    .order("created_at", { ascending: false });
  if (reviewError) {
    console.error("[supabaseProducts] review fetch error:", reviewError);
  }

  const reviews =
    reviewRows?.map((r: any) => ({
      id: r.id,
      name: r.user_name ?? undefined,
      rating: typeof r.rating === "number" ? r.rating : undefined,
      title: r.title ?? undefined,
      text: r.text,
      verified: r.verified ?? false,
      date: r.created_at,
    })) ?? [];

  const computedRating =
    reviews.length > 0
      ? {
          averageRating:
            Math.round(
              (reviews.reduce((sum: number, r: any) => sum + (r.rating ?? 0), 0) / reviews.length) * 100
            ) / 100,
          totalCount: reviews.length,
        }
      : undefined;

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

  const normalizedFaqs =
    faqRows?.map(({ question, answer, sort_order }) => ({
      question,
      answer,
      ...(sort_order == null ? {} : { sort_order }),
    })) ?? [];

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
    shortDescription: data.short_description ?? "",
    description: data.description ?? "",
    price: {
      currentPrice: Number(price.price_current) || 0,
      originalPrice: Number(price.price_original) || Number(price.price_current) || 0,
      currency: price.currency || "TRY",
    },
    quantity: firstStockQuantity,
    stockStatus: firstStockStatus,
    attributes: attributes,
    reviews,
    faqs: normalizedFaqs,
    rating:
      computedRating ??
      (data.rating_count > 0
        ? {
            averageRating: Number(data.rating_average) || 0,
            totalCount: Number(data.rating_count) || 0,
          }
        : undefined),
    metaTitle: data.meta_title ?? null,
    metaDescription: data.meta_description ?? null,
    metaKeywords: data.meta_keywords ?? null,
  };
}

export type ProductQASourceData = {
  name: string;
  brand: string;
  price: { currentPrice: number };
  description: string;
  attributes: { name: string; value: string }[];
};

export async function fetchProductForQA(idOrSlug: string): Promise<ProductQASourceData | null> {
  const selectQuery = `
    name,
    brand_name,
    description,
    attributes_json,
    current_price,
    original_price,
    currency,
    product_prices(price_current, price_original, currency)
  `;

  let { data, error } = await supabaseAdmin
    .from("products")
    .select(selectQuery)
    .eq("slug", idOrSlug)
    .maybeSingle();

  if (error || !data) {
    const result = await supabaseAdmin
      .from("products")
      .select(selectQuery)
      .eq("id", idOrSlug)
      .maybeSingle();
    data = result.data;
    error = result.error;
  }

  if (error || !data) return null;

  const priceRow = (data.product_prices as { price_current?: unknown; price_original?: unknown; currency?: unknown }[] | null)?.[0];
  const rawPrice = priceRow ?? { price_current: data.current_price };

  return {
    name: (data.name as string) ?? "",
    brand: (data.brand_name as string) ?? "",
    price: { currentPrice: Number((rawPrice as { price_current?: unknown }).price_current) || 0 },
    description: (data.description as string) ?? "",
    attributes: Array.isArray(data.attributes_json)
      ? (data.attributes_json as { name: string; value: string }[])
      : [],
  };
}
