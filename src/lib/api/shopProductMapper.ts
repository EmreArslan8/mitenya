import { r2Url } from "../utils/r2";
import { ShopProductListItemData } from "./types";

type ProductImageRow = {
  image_url: string;
  sort_order: number | null;
};

type ProductPriceRow = {
  price_current: number | null;
  price_original: number | null;
  currency: string | null;
};

type ProductStockRow = {
  quantity: number | null;
};

type ShopProductRow = {
  id: string;
  slug: string | null;
  name: string;
  brand_id: string;
  brand_name: string;
  category_name: string | null;
  current_price: number | null;
  original_price: number | null;
  currency: string | null;
  rating_average: number | null;
  rating_count: number | null;
  created_at: string | null;
  has_variants: boolean | null;
  product_prices?: ProductPriceRow[] | null;
  product_images?: ProductImageRow[] | null;
  product_stock?: ProductStockRow[] | null;
};

export const mapShopProductRow = (product: ShopProductRow): ShopProductListItemData => {
  const priceRow = product.product_prices?.[0];
  const imagesSorted = [...(product.product_images ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return {
    id: product.id,
    brand: product.brand_name,
    brandId: product.brand_id,
    category: product.category_name ?? undefined,
    name: product.name,
    url: `/product/${product.slug || product.id}`,
    createdAt: product.created_at ?? undefined,
    images: imagesSorted.map((image) => ({
      url: r2Url(image.image_url),
    })),
    imgSrc: r2Url(imagesSorted[0]?.image_url ?? ""),
    price: {
      currentPrice: Number(product.current_price ?? priceRow?.price_current ?? 0),
      originalPrice: Number(
        product.original_price ??
          priceRow?.price_original ??
          product.current_price ??
          priceRow?.price_current ??
          0
      ),
      currency: (product.currency ?? priceRow?.currency ?? "TRY") as ShopProductListItemData["price"]["currency"],
    },
    hasVariant: product.has_variants ?? false,
    quantity: product.product_stock?.[0]?.quantity ?? undefined,
    rating:
      (product.rating_count ?? 0) > 0
        ? {
            averageRating: Number(product.rating_average) || 0,
            totalCount: Number(product.rating_count) || 0,
          }
        : undefined,
  };
};
