import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { fetchProductDataSupabase } from "@/lib/api/supabaseProducts";
import { validateSameOrigin, validateCsrfToken } from "@/lib/api/security";
import { rateLimit } from "@/lib/api/rateLimit";
import { z } from "zod";

// Input validation schemas
const shippingAddressSchema = z.object({
  contactName: z.string().min(2).max(100),
  line1: z.string().min(5).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  district: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
});

const orderItemSchema = z.object({
  product_id: z.string().min(1),
  product_name: z.string().max(200),
  quantity: z.number().int().positive().max(100),
  price: z.number().nonnegative(),
  image_url: z.string().url().optional(),
  variant_data: z.record(z.string()).optional(),
});

const createOrderSchema = z.object({
  user_email: z.string().email().optional(),
  items: z.array(orderItemSchema).min(1).max(50),
  shipping_address: shippingAddressSchema,
  billing_address: shippingAddressSchema.optional(),
  payment_method: z.enum(["stripe", "paytr", "cod", "bank_transfer"]),
  shipping_cost: z.number().nonnegative().max(10000).optional(),
  discount_amount: z.number().nonnegative().max(100000).optional(),
  discount_code: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  currency: z.string().length(3).optional(),
});

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

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateSameOrigin(req);
    if (csrfError) return csrfError;
    const csrfTokenError = validateCsrfToken(req);
    if (csrfTokenError) return csrfTokenError;

    const forwarded = req.headers.get("x-forwarded-for");
    const userIp = forwarded?.split(",")[0]?.trim() || "unknown";
    if (!(await rateLimit(`orders_create:${userIp}`))) {
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

    // Input validation with Zod
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const {
      user_email: _user_email,
      items,
      shipping_address,
      billing_address,
      payment_method,
      shipping_cost = 0,
      discount_amount = 0,
      discount_code,
      notes,
      currency = "TRY",
    } = validation.data;

    // Email kontrolü
    if (!user.email && !_user_email) {
      return NextResponse.json({ error: "Email gerekli" }, { status: 400 });
    }

    // Hesaplamalar
    // Ürün fiyatlarını/verisini DB'den çekerek yeniden hesapla
    const productResults = await Promise.all(
      items.map(async (item) => {
        const product = await fetchProductDataSupabase(item.product_id);
        return { item, product };
      })
    );

    if (productResults.some(({ product }) => !product)) {
      return NextResponse.json({ error: "Geçersiz ürün" }, { status: 400 });
    }

    const sanitizedItems = productResults.map(({ item, product }) => {
      const price = product!.price.currentPrice ?? 0;
      return {
        ...item,
        product_name: product!.name || item.product_name,
        price,
        currency: product!.price.currency,
      };
    });

    const orderCurrency = sanitizedItems[0]?.currency ?? currency;
    const safeShippingCost = Math.max(shipping_cost, 0);
    const safeDiscount = Math.max(discount_amount, 0);
    const subtotal = calculateSubtotal(sanitizedItems);
    const total_amount = subtotal + safeShippingCost - safeDiscount;
    const order_number = await generateOrderNumber();

    // 1. Order oluştur
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number,
        user_id: user.id,
        user_email: user.email ?? _user_email,
        status: "processing",
        payment_status: "pending",
        payment_method,
        currency: orderCurrency,
        subtotal,
        product_cost: subtotal,
        shipping_cost: safeShippingCost,
        discount_amount: safeDiscount,
        discount_code,
        total_amount,
        shipping_address: JSON.stringify(shipping_address),
        billing_address: billing_address ? JSON.stringify(billing_address) : null,
        notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order oluşturma hatası:", orderError.code);
      return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
    }

    // 2. Order items oluştur
    const orderItems = sanitizedItems.map((item) => ({
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
      console.error("Order items oluşturma hatası:", itemsError.code);
      // Order'ı sil (rollback)
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Sipariş kalemleri oluşturulamadı" }, { status: 500 });
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

  } catch (err: unknown) {
    console.error("Order API hatası:", err instanceof Error ? err.message : "Unknown");
    return NextResponse.json({ error: "Sunucu hatası oluştu" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
