import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateSameOrigin, validateCsrfToken } from "@/lib/api/security";
import { rateLimit } from "@/lib/api/rateLimit";
import { getClientIp } from "@/lib/api/getClientIp";

// Test için ödeme simülasyonu - sadece development'ta kullanılmalı
export async function POST(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const csrfError = validateSameOrigin(req);
    if (csrfError) return csrfError;
    const csrfTokenError = validateCsrfToken(req);
    if (csrfTokenError) return csrfTokenError;

    const userIp = getClientIp(req);
    if (!(await rateLimit(`orders_pay:${userIp}`))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderNumber } = params;

    // Order'ı bul
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);

    let query = supabaseAdmin.from("orders").select("*");

    if (isUUID) {
      query = query.eq("id", orderNumber);
    } else {
      query = query.eq("order_number", orderNumber);
    }

    const { data: order, error: findError } = await query.single();

    if (findError || !order) {
      return NextResponse.json({ error: "Siparis bulunamadi" }, { status: 404 });
    }

    const isOwner =
      order.user_id === user.id ||
      (!!order.user_email && !!user.email && order.user_email === user.email);

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ödeme durumunu güncelle
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Odeme basarili",
      order_number: order.order_number,
    });

  } catch (err: any) {
    console.error("Payment simulation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
