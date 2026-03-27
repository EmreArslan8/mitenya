import { NextRequest, NextResponse } from "next/server";
import { fetchProductDataSupabase } from "@/lib/api/supabaseProducts";
import { OrderSummaryRequestData, ShopCoupon, ShopProductData } from "@/lib/api/types";
import { calculateOrderSummary } from "@/lib/shop/calculateOrderSummary";
import { supabaseAdmin } from "@/lib/supabase/admin";

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

const fetchCouponData = async (
  normalizedCode?: string
): Promise<{ percent: number; affiliateCode: string | null } | undefined> => {
  if (!normalizedCode || !cmsApiUrl || !cmsBearer) return undefined;

  try {
    const params = new URLSearchParams({
      publicationState: "live",
      populate: "deep,4",
      "pagination[pageSize]": "1",
      sort: "publishedAt:desc",
    });

    const res = await fetch(`${cmsApiUrl}/shop-coupon-sets?${params.toString()}`, {
      headers: { Authorization: `Bearer ${cmsBearer}` },
      cache: "no-store",
    });

    if (!res.ok) return undefined;

    const data = await res.json();
    const coupons: ShopCoupon[] = data?.data?.[0]?.attributes?.coupons ?? [];
    const now = new Date();

    const activeCoupon = coupons.find((coupon) => {
      const code = coupon.code?.trim().toUpperCase();
      const start = coupon.startDate ? new Date(coupon.startDate) : null;
      const end = coupon.endDate ? new Date(coupon.endDate) : null;

      if (!code || code !== normalizedCode) return false;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return false;
      return now >= start && now <= end;
    });

    const percent = activeCoupon?.discountPercent;
    if (typeof percent !== "number" || percent <= 0) return undefined;

    // Aynı kod bir influencer'a ait mi kontrol et
    const { data: affiliate } = await supabaseAdmin
      .from("affiliates")
      .select("code")
      .eq("code", normalizedCode)
      .eq("status", "active")
      .maybeSingle();

    return { percent, affiliateCode: affiliate?.code ?? null };
  } catch (error) {
    console.error("fetchCouponData error:", error);
    return undefined;
  }
};

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
