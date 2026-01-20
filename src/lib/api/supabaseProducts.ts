import { getSupabaseAnon } from "../supabase/anon";
import { r2Url } from "../utils/r2";
import { ShopProductAttribute } from "./types";

// Types for Supabase response
interface ProductImage {
  image_path: string | null;
  image_url: string | null;
  is_main: boolean;
  sort_order: number;
}

interface ProductPrice {
  price_current: number;
  price_original: number;
  currency: string;
}

interface ProductStock {
  quantity: number;
}

// Product select fields (DRY - used for both slug and id queries)
const PRODUCT_SELECT_FIELDS = `
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
  product_prices(price_current, price_original, currency),
  product_images(image_path, image_url, is_main, sort_order),
  product_stock(quantity),
  attributes_json
` as const;

export async function fetchProductDataSupabase(idOrSlug: string) {
  const supabase = getSupabaseAnon();

  // Try slug first, then fallback to id
  let { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT_FIELDS)
    .eq("slug", idOrSlug)
    .single();

  // Fallback to id if slug not found
  if (error || !data) {
    const result = await supabase
      .from("products")
      .select(PRODUCT_SELECT_FIELDS)
      .eq("id", idOrSlug)
      .single();

    data = result.data;
    error = result.error;
  }

  if (error || !data) {
    console.error("[SUPABASE] Product not found:", idOrSlug, error?.message);
    return null;
  }

  const price = (data.product_prices as ProductPrice[] | null)?.[0];
  const images = data.product_images as ProductImage[] | null;
  const stock = data.product_stock as ProductStock[] | null;

  // Sort images by sort_order
  const imagesSorted = [...(images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  // Transform image paths to CDN URLs
  const imageUrls: string[] = imagesSorted.map((img) => {
    const pathOrUrl = img.image_path || img.image_url || "";
    return r2Url(pathOrUrl);
  });

  const imgSrc = imageUrls[0] ?? "";

  // Parse attributes (could be JSON string or already parsed)
  const attributes: ShopProductAttribute[] = Array.isArray(data.attributes_json)
    ? data.attributes_json
    : [];

  return {
    id: data.id,
    brand: data.brand_name,
    brandId: data.brand_id,
    name: data.name,
    category: data.category_name,
    url: `/product/${data.slug || data.id}`,
    images: imageUrls,
    imgSrc,
    description: data.description ?? "",
    price: {
      currentPrice: price?.price_current ?? 0,
      originalPrice: price?.price_original ?? price?.price_current ?? 0,
      currency: price?.currency ?? "TRY",
    },
    quantity: stock?.[0]?.quantity ?? 0,
    attributes,
    rating:
      data.rating_count > 0
        ? {
            averageRating: Number(data.rating_average) || 0,
            totalCount: Number(data.rating_count) || 0,
          }
        : undefined,
  };
}
