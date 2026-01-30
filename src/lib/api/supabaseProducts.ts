import { supabaseAdmin } from "../supabase/admin";
import { r2Url } from "../utils/r2"; 

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
      attributes_json
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
    console.log("❌ Ürün bulunamadı:", error);
    return null;
  }

 /* const { data: faqRows } = await supabase
    .from("product_faqs")
    .select("question, answer, sort_order")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

    console.log("faq:", faqRows)

    */

  const priceRow = data.product_prices?.[0];
  const price = priceRow ?? {
    price_current: data.current_price,
    price_original: data.original_price,
    currency: data.currency,
  };

  // 🔍 DEBUG: DB'den gelen ham image verisini görelim
 // console.log("🟨 [SUPABASE] product_images RAW:", data.product_images);

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

  // 🔍 DEBUG: Frontend'e gidecek URL'leri görelim
  //console.log("🟩 [SUPABASE] Mapped imageUrls:", imageUrls);
  //console.log("🟩 [SUPABASE] imgSrc:", imgSrc);

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
      currentPrice: Number(price.price_current) || 0,
      originalPrice: Number(price.price_original) || Number(price.price_current) || 0,
      currency: price.currency || "TRY",
    },
    quantity: data.product_stock?.[0]?.quantity ?? 0,
    attributes: attributes,
   // faqs: faqRows ?? [], 
    rating:
      data.rating_count > 0
        ? {
            averageRating: Number(data.rating_average) || 0,
            totalCount: Number(data.rating_count) || 0,
          }
        : undefined,
  };
}
