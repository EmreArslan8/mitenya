import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("t");
    if (!token) {
      return NextResponse.json({ error: "Siparis bulunamadi" }, { status: 404 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("metadata->>success_token", token)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Siparis bulunamadi" }, { status: 404 });
    }

    const rawMeta = order.metadata ?? null;
    let meta: any = rawMeta;
    try {
      if (typeof rawMeta === "string") meta = JSON.parse(rawMeta);
    } catch {
      meta = rawMeta;
    }

    const expiresAt = meta?.success_token_expires_at;
    if (expiresAt) {
      const expiry = new Date(expiresAt).getTime();
      if (!Number.isFinite(expiry) || Date.now() > expiry) {
        return NextResponse.json({ error: "Siparis bulunamadi" }, { status: 404 });
      }
    }

    // Token'ı ilk okumada silmiyoruz.
    // Aksi halde local/dev'de çift istek veya ağ tekrarlarında ikinci istek 404 dönebiliyor.
    // Güvenlik için süre kontrolü (success_token_expires_at) zaten uygulanıyor.

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    let shippingAddress = null;
    if (order.shipping_address) {
      try {
        shippingAddress =
          typeof order.shipping_address === "string"
            ? JSON.parse(order.shipping_address)
            : order.shipping_address;
      } catch {
        shippingAddress = order.shipping_address;
      }
    }

    return NextResponse.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        total_amount: parseFloat(order.total_amount),
        subtotal: parseFloat(order.subtotal || order.product_cost || 0),
        shipping_cost: parseFloat(order.shipping_cost || 0),
        discount_amount: parseFloat(order.discount_amount || 0),
        currency: order.currency,
        shipping_address: shippingAddress,
        tracking_number: order.tracking_number,
        created_at: order.created_at,
        items: items || [],
      },
    });
  } catch (err: any) {
    console.error("Order success error:", err);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
