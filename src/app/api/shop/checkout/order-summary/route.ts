import { NextRequest, NextResponse } from "next/server";
import { fetchProductDataSupabase } from "@/lib/api/supabaseProducts";
import { OrderSummaryRequestData, ShopProductData } from "@/lib/api/types";
import { calculateOrderSummary } from "@/lib/shop/calculateOrderSummary";
import { fetchCouponData } from "@/lib/shop/fetchCouponData";

export const POST = async (req: NextRequest) => {
  try {
    const {
      products,
      discountCode
    }: OrderSummaryRequestData = await req.json();

    if (!products?.length) {
      return NextResponse.json(
        { error: "Bad request: no products." },
        { status: 400 }
      );
    }

    const revalidatedProducts: (ShopProductData & {
      listingId: string;
      quantity: number;
    })[] = [];

    for (const item of products) {
      const data = await fetchProductDataSupabase(item.id);

      if (!data) {
        return NextResponse.json(
          { error: "Product not found in database" },
          { status: 500 }
        );
      }

      revalidatedProducts.push({
        ...data,
        listingId: item.id,
        quantity: item.quantity ?? 1,
      });
    }

    const normalizedCode = discountCode?.trim().toUpperCase();
    const couponData = await fetchCouponData(normalizedCode);

    const summary = calculateOrderSummary({
      products: revalidatedProducts,
      discountCode: normalizedCode,
      couponDiscountPercent: couponData?.percent,
    });

    return NextResponse.json({
      orderSummary: { ...summary, affiliateCode: couponData?.affiliateCode ?? null },
    });
  } catch (err) {
    console.error("order-summary API ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error (order-summary)" },
      { status: 500 }
    );
  }
};

export const dynamic = "force-dynamic";
export const maxDuration = 60;
