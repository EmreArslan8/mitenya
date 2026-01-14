import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Test için ödeme simülasyonu - sadece development'ta kullanılmalı
export async function POST(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = await params;

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
