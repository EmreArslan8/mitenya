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
  pre_info_html: z.string().min(1).max(500000),
  distance_sale_html: z.string().min(1).max(500000),
});

const createCheckoutSessionSchema = z.object({
  user_email: z.string().email().optional(),
  items: z.array(orderItemSchema).min(1).max(50),
  shipping_address: shippingAddressSchema,
  billing_address: shippingAddressSchema.optional(),
  payment_method: z.enum(['stripe', 'paytr']),
  shipping_cost: z.number().nonnegative().max(10000).optional(),
  discount_amount: z.number().nonnegative().max(100000).optional(),
  discount_code: z.string().max(50).nullable().optional(),
  notes: z.string().max(500).optional(),
  currency: z.string().length(3).optional(),
  consents: consentsSchema.optional(),
});

function calculateSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

function createSuccessToken() {
  return `${crypto.randomUUID().replace(/-/g, '')}${Date.now().toString(36)}`.slice(0, 64);
}

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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      items,
      shipping_address,
      billing_address,
      payment_method,
      shipping_cost = 0,
      discount_amount = 0,
      discount_code,
      notes,
      currency = 'TRY',
      consents,
    } = validation.data;

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
    const safeShippingCost = Math.max(shipping_cost, 0);
    const safeDiscount = Math.max(discount_amount, 0);
    const subtotal = calculateSubtotal(sanitizedItems);
    const totalAmount = subtotal + safeShippingCost - safeDiscount;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ error: 'Geçersiz sipariş tutarı' }, { status: 400 });
    }

    const now = Date.now();
    const expiresAt = new Date(now + SESSION_TTL_MINUTES * 60_000).toISOString();
    const successToken = createSuccessToken();
    const successTokenExpiresAt = new Date(now + 2 * 60 * 60_000).toISOString();

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('checkout_sessions')
      .insert({
        user_id: user.id,
        user_email: user.email ?? userEmailFromBody ?? null,
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
        notes: notes ?? null,
        consents_snapshot: consents ?? null,
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
