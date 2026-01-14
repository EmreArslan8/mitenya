import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number gerekli" }, { status: 400 });
    }

    // Order'ı order_number veya id ile bul
    let query = supabaseAdmin
      .from("orders")
      .select("*");

    // UUID formatında mı kontrol et
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);

    if (isUUID) {
      query = query.eq("id", orderNumber);
    } else {
      query = query.eq("order_number", orderNumber);
    }

    const { data: order, error: orderError } = await query.single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Siparis bulunamadi" }, { status: 404 });
    }

    // Order items'ları çek
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) {
      console.error("Order items hatası:", itemsError);
    }

    // shipping_address'i parse et
    let shippingAddress = null;
    if (order.shipping_address) {
      try {
        shippingAddress = typeof order.shipping_address === 'string'
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;
      } catch (e) {
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
    console.error("Order GET hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
