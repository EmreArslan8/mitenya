import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { fetchProductDataSupabase } from "@/lib/api/supabaseProducts";
import { validateSameOrigin, validateCsrfToken } from "@/lib/api/security";
import { rateLimit } from "@/lib/api/rateLimit";
import { createAffiliateConversion } from "@/lib/affiliates/commissionService";
import { type OrderAttribution } from "@/lib/analytics/attribution";
import { sendCapiPurchase } from "@/lib/analytics/metaCapi";
import { parseCookieHeader } from "@/lib/analytics/attribution";
import { sendTikTokServerEvent } from "@/lib/analytics/tiktokEventsApi";
import { z } from "zod";


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
  variant_data: z.record(z.string(), z.string()).optional(),
});

const consentsSchema = z.object({
  pre_info_accepted: z.boolean().refine((v) => v === true, {
    message: "Ön bilgilendirme formu kabul edilmelidir",
  }),
  distance_sale_accepted: z.boolean().refine((v) => v === true, {
    message: "Mesafeli satış sözleşmesi kabul edilmelidir",
  }),
  pre_info_html: z.string().min(1).max(500000),
  distance_sale_html: z.string().min(1).max(500000),
});

const attributionSchema = z.object({
  affiliateCode: z.string().max(20).nullable().optional(),
  affiliateClickId: z.string().max(100).nullable().optional(),
  utmSource: z.string().max(120).nullable().optional(),
  utmMedium: z.string().max(120).nullable().optional(),
  utmCampaign: z.string().max(160).nullable().optional(),
  utmContent: z.string().max(160).nullable().optional(),
  utmTerm: z.string().max(160).nullable().optional(),
  landingPath: z.string().max(255).nullable().optional(),
  referrer: z.string().max(500).nullable().optional(),
  tikTokClickId: z.string().max(500).nullable().optional(),
  tikTokTtp: z.string().max(500).nullable().optional(),
  tikTokMarketingConsent: z.boolean().nullable().optional(),
});

const createOrderSchema = z.object({
  user_email: z.string().email().optional(),
  guest_email: z.string().email().optional(),
  items: z.array(orderItemSchema).min(1).max(50),
  shipping_address: shippingAddressSchema,
  billing_address: shippingAddressSchema.optional(),
  payment_method: z.enum(["cod", "bank_transfer"]),
  shipping_cost: z.number().nonnegative().max(10000).optional(),
  discount_amount: z.number().nonnegative().max(100000).optional(),
  discount_code: z.string().max(50).nullable().optional(),
  affiliate_code: z.string().max(20).nullable().optional(),
  attribution: attributionSchema.optional(),
  notes: z.string().max(500).optional(),
  currency: z.string().length(3).optional(),
  consents: consentsSchema,
});

const parseJsonIfNeeded = <T>(value: unknown): T | null => {
  if (!value) return null;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

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

interface EdgeCreateOrderResponse {
  order?: {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
  };
  success_token?: string;
  error?: string;
  details?: {
    code?: string;
    [key: string]: unknown;
  };
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
    } = await supabase.auth.getUser();

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

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
      guest_email,
      items,
      shipping_address,
      billing_address,
      payment_method,
      shipping_cost = 0,
      discount_amount = 0,
      discount_code,
      affiliate_code,
      attribution,
      notes,
      currency = "TRY",
      consents,
    } = validation.data;

    if (payment_method !== "cod" && payment_method !== "bank_transfer") {
      return NextResponse.json(
        { error: "Kartlı ödemede sipariş callback sonrası oluşturulur. /api/checkout/session kullanın." },
        { status: 409 }
      );
    }

    // Email kontrolü
    const effectiveEmail = user?.email ?? guest_email ?? _user_email;
    if (!effectiveEmail) {
      return NextResponse.json({ error: "Email gerekli" }, { status: 400 });
    }

    // Misafir profili oluştur
    let guestCustomerId: string | null = null;
    if (!user && guest_email) {
      const nameParts = (shipping_address?.contactName ?? '').trim().split(' ');
      const { data: guestCustomer } = await supabaseAdmin
        .from('customers')
        .upsert(
          {
            email: guest_email,
            phone: shipping_address?.phone ?? null,
            name: nameParts[0] ?? null,
            surname: nameParts.length > 1 ? nameParts.slice(1).join(' ') : null,
            type: 'guest',
            provider_id: null,
          },
          { onConflict: 'email' }
        )
        .select('id')
        .single();
      guestCustomerId = guestCustomer?.id ?? null;
    }

    const normalizedAffiliateCode = affiliate_code ?? attribution?.affiliateCode ?? null;

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

    const orderItems = sanitizedItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image_url,
      variant_data: item.variant_data ?? null,
      currency: item.currency ?? orderCurrency,
      total_price: item.price * item.quantity,
    }));

    const eventDescription = `Sipariş oluşturuldu. Ödeme yöntemi: ${
      payment_method === "cod" ? "Kapıda Ödeme" : "Banka Transferi"
    }`;

    const documents = consents
      ? [
          {
            doc_type: "pre_info",
            doc_version: "1.0",
            content_html: consents.pre_info_html,
          },
          {
            doc_type: "distance_sale",
            doc_version: "1.0",
            content_html: consents.distance_sale_html,
          },
        ]
      : null;

    const consentBase = {
      doc_version: "1.0",
      accepted_at: new Date().toISOString(),
      ip: userIp,
      user_agent: req.headers.get("user-agent") || "",
      user_id: user?.id ?? null,
      user_email: effectiveEmail,
      customer_id: guestCustomerId,
    };
    const consentsRows = consents
      ? [
          { ...consentBase, doc_type: "pre_info" },
          { ...consentBase, doc_type: "distance_sale" },
        ]
      : null;

    const paymentStatus = payment_method === "bank_transfer" ? "awaiting_transfer" : "awaiting_payment";

    const baseEdgePayload = {
      order_number,
      user_id: user?.id ?? null,
      customer_id: guestCustomerId,
      user_email: effectiveEmail,
      payment_status: paymentStatus,
      payment_method,
      currency: orderCurrency,
      subtotal,
      product_cost: subtotal,
      shipping_cost: safeShippingCost,
      discount_amount: safeDiscount,
      discount_code: discount_code ?? null,
      affiliate_code: normalizedAffiliateCode,
      total_amount,
      shipping_address,
      billing_address: billing_address ?? null,
      notes: notes ?? null,
      order_items: orderItems,
      event_status: "created",
      event_description: eventDescription,
      documents,
      consents: consentsRows,
    };

    const edgeAuthToken = accessToken ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const edgeHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${edgeAuthToken}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    };

    const callCreateOrderEdge = async (payload: Record<string, unknown>) => {
      const edgeResponse = await fetch(
        "https://iimmsbvyxizrdfresfcb.functions.supabase.co/create-order",
        {
          method: "POST",
          headers: edgeHeaders,
          body: JSON.stringify(payload),
        }
      );

      const edgeText = await edgeResponse.text();
      let edgeData: EdgeCreateOrderResponse = {};
      try {
        edgeData = edgeText ? (JSON.parse(edgeText) as EdgeCreateOrderResponse) : {};
      } catch {
        edgeData = {};
      }

      return { edgeResponse, edgeData, edgeText };
    };

    let { edgeResponse, edgeData, edgeText } = await callCreateOrderEdge({
      ...baseEdgePayload,
      status: "processing",
    });

    if (!edgeResponse.ok && edgeData?.details?.code === "42804") {
      ({ edgeResponse, edgeData, edgeText } = await callCreateOrderEdge(baseEdgePayload));
    }

    if (!edgeResponse.ok || !edgeData?.order) {
      console.error("Order oluşturma hatası (edge):", edgeData || edgeText);
      return NextResponse.json(
        {
          error: edgeData?.error || "Sipariş oluşturulamadı",
          details: edgeData?.details || {
            status: edgeResponse.status,
            statusText: edgeResponse.statusText,
            body: edgeText?.slice(0, 1000) || "",
          },
        },
        { status: 500 }
      );
    }

    const order = edgeData.order;
    const successToken = edgeData.success_token;

    const { data: currentOrder } = await supabaseAdmin
      .from("orders")
      .select("metadata")
      .eq("id", order.id)
      .maybeSingle();

    const existingMetadata = parseJsonIfNeeded<Record<string, unknown>>(currentOrder?.metadata) || {};
    const nextMetadata: Record<string, unknown> = {
      ...existingMetadata,
    };

    if (successToken) {
      nextMetadata.success_token = successToken;
    }

    if (attribution && Object.values(attribution).some(Boolean)) {
      nextMetadata.attribution = attribution as OrderAttribution;
    }

    if (Object.keys(nextMetadata).length > 0) {
      await supabaseAdmin.from("orders").update({ metadata: nextMetadata }).eq("id", order.id);
    }

    if (normalizedAffiliateCode && order.id) {
      await createAffiliateConversion({
        affiliateCode: normalizedAffiliateCode,
        orderId: order.id,
        orderNumber: order.order_number,
        orderAmount: order.total_amount,
        affiliateClickId: attribution?.affiliateClickId ?? null,
      });
    }

    const nameParts = (shipping_address.contactName ?? '').trim().split(' ');
    sendCapiPurchase({
      eventId: `purchase_${order.order_number}`,
      value: total_amount,
      currency: orderCurrency,
      contentIds: sanitizedItems.map((i) => String(i.product_id)),
      numItems: sanitizedItems.reduce((acc, i) => acc + i.quantity, 0),
      orderId: order.order_number,
      userData: {
        email: effectiveEmail ?? undefined,
        phone: shipping_address.phone ?? null,
        firstName: nameParts[0] ?? null,
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : null,
        city: shipping_address.city ?? null,
        country: 'turkey',
        clientIp: userIp !== 'unknown' ? userIp : null,
        clientUserAgent: req.headers.get('user-agent'),
      },
    }).catch((err) => console.error('[MetaCAP] Purchase send error', err));

    const cookies = parseCookieHeader(req.headers.get('cookie'));
    if (cookies.mitenya_marketing_consent === '1' || attribution?.tikTokMarketingConsent === true) {
      sendTikTokServerEvent({
        event: 'Purchase',
        eventId: `purchase_${order.order_number}`,
        value: total_amount,
        currency: orderCurrency,
        contents: sanitizedItems.map((item) => ({
          content_id: String(item.product_id),
          content_type: 'product',
          content_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        })),
        orderId: order.order_number,
        pageUrl: `${process.env.NEXT_PUBLIC_HOST_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mitenya.com'}/success`,
        referrer: attribution?.referrer ?? null,
        user: {
          email: effectiveEmail ?? undefined,
          phone: shipping_address.phone ?? null,
          externalId: user?.id ?? guestCustomerId ?? undefined,
          ip: userIp !== 'unknown' ? userIp : null,
          userAgent: req.headers.get('user-agent'),
          ttclid: attribution?.tikTokClickId ?? cookies.ttclid ?? null,
          ttp: attribution?.tikTokTtp ?? cookies._ttp ?? null,
        },
      }).catch((err) => console.error('[TikTokEventsAPI] Purchase send error', err));
    }

    return NextResponse.json({
      success: true,
      success_token: successToken,
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
