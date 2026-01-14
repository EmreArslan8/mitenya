import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Order number generator: ORD-2026-00001
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  // Son order number'ı bul
  const { data } = await supabaseAdmin
    .from("orders")
    .select("order_number")
    .like("order_number", `${prefix}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (data?.order_number) {
    const lastNumber = parseInt(data.order_number.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
}

// Subtotal hesaplama
function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  variant_data?: Record<string, string>;
}

interface ShippingAddress {
  contactName: string;
  line1: string;
  line2?: string;
  city: string;
  district?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

interface CreateOrderRequest {
  user_email: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  payment_method: "stripe" | "paytr" | "cod" | "bank_transfer";
  shipping_cost?: number;
  discount_amount?: number;
  discount_code?: string;
  notes?: string;
  currency?: string;
}

export async function POST(req: Request) {
  try {
    const body: CreateOrderRequest = await req.json();

    const {
      user_email,
      items,
      shipping_address,
      billing_address,
      payment_method,
      shipping_cost = 0,
      discount_amount = 0,
      discount_code,
      notes,
      currency = "TRY",
    } = body;

    // Validasyon
    if (!user_email) {
      return NextResponse.json({ error: "user_email gerekli" }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "En az 1 ürün gerekli" }, { status: 400 });
    }
    if (!shipping_address) {
      return NextResponse.json({ error: "shipping_address gerekli" }, { status: 400 });
    }

    // Hesaplamalar
    const subtotal = calculateSubtotal(items);
    const total_amount = subtotal + shipping_cost - discount_amount;
    const order_number = await generateOrderNumber();

    // 1. Order oluştur
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number,
        user_email,
        status: "processing",
        payment_status: "pending",
        payment_method,
        currency,
        subtotal,
        product_cost: subtotal,
        shipping_cost,
        discount_amount,
        discount_code,
        total_amount,
        shipping_address: JSON.stringify(shipping_address),
        billing_address: billing_address ? JSON.stringify(billing_address) : null,
        notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order oluşturma hatası:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 2. Order items oluştur
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image_url,
      variant_data: item.variant_data ? JSON.stringify(item.variant_data) : null,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items oluşturma hatası:", itemsError);
      // Order'ı sil (rollback)
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // 3. Order event oluştur (sipariş geçmişi için)
    await supabaseAdmin.from("order_events").insert({
      order_id: order.id,
      status: "created",
      description: `Sipariş oluşturuldu. Ödeme yöntemi: ${
        payment_method === "cod" ? "Kapıda Ödeme" :
        payment_method === "paytr" ? "Kredi Kartı (PayTR)" :
        payment_method === "stripe" ? "Kredi Kartı (Stripe)" : "Banka Transferi"
      }`,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
      },
    });

  } catch (err: any) {
    console.error("Order API hatası:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
