import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchProductDataSupabase } from '@/lib/api/supabaseProducts';
import { validateSameOrigin, validateCsrfToken } from '@/lib/api/security';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { reserveCheckoutStock } from '@/lib/inventory/stockReservationService';
import { parseCookieHeader, serializeCheckoutNotes } from '@/lib/analytics/attribution';
import { sendTikTokServerEvent } from '@/lib/analytics/tiktokEventsApi';
import { fetchCouponData } from '@/lib/shop/fetchCouponData';
import { calculateOrderSummary } from '@/lib/shop/calculateOrderSummary';
import {
  generateDistanceSaleHtml,
  generatePreInfoHtml,
  type ContractData,
} from '@/lib/legal/contractTemplates';

const SESSION_TTL_MINUTES = 30;

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
    message: 'Ön bilgilendirme formu kabul edilmelidir',
  }),
  distance_sale_accepted: z.boolean().refine((v) => v === true, {
    message: 'Mesafeli satış sözleşmesi kabul edilmelidir',
  }),
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

const optionalEmailSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() || undefined : value),
  z.string().email().optional()
);

const createCheckoutSessionSchema = z.object({
  user_email: optionalEmailSchema,
  guest_email: optionalEmailSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  shipping_address: shippingAddressSchema,
  billing_address: shippingAddressSchema.optional(),
  payment_method: z.enum(['stripe', 'paytr']),
  // shipping_cost and discount_amount are NOT accepted from client — computed server-side
  discount_code: z.string().max(50).nullable().optional(),
  affiliate_code: z.string().max(20).nullable().optional(),
  attribution: attributionSchema.optional(),
  notes: z.string().max(500).optional(),
  currency: z.string().length(3).optional(),
  consents: consentsSchema,
});

function createSuccessToken() {
  return `${crypto.randomUUID().replace(/-/g, '')}${Date.now().toString(36)}`.slice(0, 64);
}

const formatAddress = (address: {
  line1?: string;
  line2?: string;
  district?: string;
  city?: string;
  postalCode?: string;
}) =>
  [address.line1, address.line2, address.district, address.city, address.postalCode]
    .filter(Boolean)
    .join(', ');

const buildServerContractData = ({
  effectiveEmail,
  shippingAddress,
  billingAddress,
  items,
  summary,
  currency,
}: {
  effectiveEmail: string;
  shippingAddress: z.infer<typeof shippingAddressSchema>;
  billingAddress?: z.infer<typeof shippingAddressSchema>;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    variant_data?: Record<string, string> | null;
  }>;
  summary: ReturnType<typeof calculateOrderSummary>;
  currency: string;
}): ContractData => {
  const deliveryAddress = formatAddress(shippingAddress);
  const buyerAddress = formatAddress(billingAddress ?? shippingAddress);

  return {
    buyer: {
      fullName: shippingAddress.contactName,
      address: buyerAddress,
      phone: shippingAddress.phone ?? '',
      email: effectiveEmail,
    },
    products: items.map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      variant: item.variant_data
        ? Object.entries(item.variant_data)
            .map(([name, value]) => `${name}: ${value}`)
            .join(', ')
        : undefined,
    })),
    orderSummary: {
      subtotal: summary.productCost,
      shippingCost: summary.shipmentCost ?? 0,
      discount: summary.totalDiscount ?? 0,
      total: summary.totalDue,
      currency,
    },
    paymentMethod: 'Kredi / Banka Kartı',
    deliveryAddress,
    date: new Date().toLocaleDateString('tr-TR'),
  };
};

export async function POST(req: NextRequest) {
  try {
    const csrfError = validateSameOrigin(req);
    if (csrfError) return csrfError;
    const csrfTokenError = validateCsrfToken(req);
    if (csrfTokenError) return csrfTokenError;

    const userIp = getClientIp(req);
    if (!(await rateLimit(`checkout_session_create:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = createCheckoutSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const {
      user_email: userEmailFromBody,
      guest_email,
      items,
      shipping_address,
      billing_address,
      payment_method,
      discount_code,
      affiliate_code,
      attribution,
      notes,
      currency = 'TRY',
      consents,
    } = validation.data;

    const effectiveEmail = (user?.email || guest_email || userEmailFromBody || '').trim();
    if (!effectiveEmail) {
      return NextResponse.json({ error: 'Email gerekli' }, { status: 400 });
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

    const productResults = await Promise.all(
      items.map(async (item) => {
        const product = await fetchProductDataSupabase(item.product_id);
        return { item, product };
      })
    );

    if (productResults.some(({ product }) => !product)) {
      return NextResponse.json({ error: 'Geçersiz ürün' }, { status: 400 });
    }

    const sanitizedItems = productResults.map(({ item, product }) => {
      const price = product!.price.currentPrice ?? 0;
      return {
        product_id: item.product_id,
        product_name: product!.name || item.product_name,
        quantity: item.quantity,
        price,
        image_url: item.image_url,
        variant_data: item.variant_data ?? null,
        currency: product!.price.currency ?? currency,
        total_price: price * item.quantity,
      };
    });

    const orderCurrency = sanitizedItems[0]?.currency ?? currency;

    // Server-side pricing: ignore client shipping_cost / discount_amount
    const normalizedDiscountCode = discount_code?.trim().toUpperCase() ?? undefined;
    const couponData = await fetchCouponData(normalizedDiscountCode);
    const summaryProducts = productResults.map(({ item, product }) => ({
      ...product!,
      listingId: item.product_id,
      quantity: item.quantity,
    }));
    const serverSummary = calculateOrderSummary({
      products: summaryProducts,
      discountCode: normalizedDiscountCode,
      couponDiscountPercent: couponData?.percent,
    });

    const safeShippingCost = serverSummary.shipmentCost;
    const safeDiscount = serverSummary.promotionDiscount;
    const subtotal = serverSummary.productCost;
    const totalAmount = serverSummary.totalDue;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ error: 'Geçersiz sipariş tutarı' }, { status: 400 });
    }

    const now = Date.now();
    const expiresAt = new Date(now + SESSION_TTL_MINUTES * 60_000).toISOString();
    const successToken = createSuccessToken();
    const successTokenExpiresAt = new Date(now + 2 * 60 * 60_000).toISOString();

    const cookies = parseCookieHeader(req.headers.get('cookie'));
    const hasTikTokMarketingConsent = cookies.mitenya_marketing_consent === '1';
    const normalizedAffiliateCode = couponData?.affiliateCode ?? affiliate_code ?? attribution?.affiliateCode ?? null;
    const serializedNotes = serializeCheckoutNotes(notes, {
      ...attribution,
      affiliateCode: normalizedAffiliateCode,
      tikTokClickId: attribution?.tikTokClickId ?? cookies.ttclid ?? null,
      tikTokTtp: attribution?.tikTokTtp ?? cookies._ttp ?? null,
      tikTokMarketingConsent: hasTikTokMarketingConsent,
    });
    const serverContractData = buildServerContractData({
      effectiveEmail,
      shippingAddress: shipping_address,
      billingAddress: billing_address,
      items: sanitizedItems,
      summary: serverSummary,
      currency: orderCurrency,
    });
    const serverConsents = {
      pre_info_accepted: consents.pre_info_accepted,
      distance_sale_accepted: consents.distance_sale_accepted,
      pre_info_html: generatePreInfoHtml(serverContractData),
      distance_sale_html: generateDistanceSaleHtml(serverContractData),
    };

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('checkout_sessions')
      .insert({
        user_id: user?.id ?? null,
        customer_id: guestCustomerId,
        user_email: effectiveEmail,
        status: 'active',
        payment_method,
        cart_snapshot: sanitizedItems,
        pricing_snapshot: {
          subtotal,
          product_cost: subtotal,
          shipping_cost: safeShippingCost,
          discount_amount: safeDiscount,
          total_amount: totalAmount,
          currency: orderCurrency,
        },
        shipping_address_snapshot: shipping_address,
        billing_address_snapshot: billing_address ?? null,
        discount_snapshot: {
          code: discount_code ?? null,
          amount: safeDiscount,
        },
        notes: serializedNotes ?? null,
        affiliate_code: normalizedAffiliateCode,
        consents_snapshot: serverConsents,
        success_token: successToken,
        success_token_expires_at: successTokenExpiresAt,
        expires_at: expiresAt,
      })
      .select('id, expires_at, success_token')
      .single();

    if (sessionError || !session) {
      console.error('checkout session create error', sessionError);
      return NextResponse.json({ error: 'Checkout session oluşturulamadı' }, { status: 500 });
    }

    const reservationResult = await reserveCheckoutStock(supabaseAdmin, {
      checkoutSessionId: session.id,
      items: sanitizedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      expiresAt: session.expires_at,
    });

    if (!reservationResult.ok) {
      await supabaseAdmin
        .from('checkout_sessions')
        .update({ status: 'abandoned', updated_at: new Date().toISOString() })
        .eq('id', session.id)
        .neq('status', 'completed');

      const statusCode = reservationResult.code === 'insufficient_stock' ? 409 : 500;
      return NextResponse.json(
        {
          error:
            reservationResult.message ||
            (reservationResult.code === 'insufficient_stock'
              ? 'Yetersiz stok'
              : 'Stok rezerve edilemedi'),
          code: reservationResult.code,
          details: reservationResult.details,
        },
        { status: statusCode }
      );
    }

    if (hasTikTokMarketingConsent) {
      sendTikTokServerEvent({
        event: 'InitiateCheckout',
        eventId: `initiate_checkout_${session.id}`,
        value: totalAmount,
        currency: orderCurrency,
        contents: sanitizedItems.map((item) => ({
          content_id: String(item.product_id),
          content_type: 'product',
          content_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        })),
        pageUrl: `${process.env.NEXT_PUBLIC_HOST_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mitenya.com'}/checkout`,
        referrer: attribution?.referrer ?? null,
        user: {
          email: effectiveEmail,
          phone: shipping_address.phone ?? null,
          externalId: user?.id ?? guestCustomerId ?? undefined,
          ip: userIp,
          userAgent: req.headers.get('user-agent'),
          ttclid: attribution?.tikTokClickId ?? cookies.ttclid ?? null,
          ttp: attribution?.tikTokTtp ?? cookies._ttp ?? null,
        },
      }).catch((error) => console.error('[TikTokEventsAPI] InitiateCheckout send error', error));
    }

    return NextResponse.json(
      {
        success: true,
        checkoutSessionId: session.id,
        expiresAt: session.expires_at,
        success_token: session.success_token,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('checkout session create error', err);
    return NextResponse.json({ error: 'Sunucu hatası oluştu' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
