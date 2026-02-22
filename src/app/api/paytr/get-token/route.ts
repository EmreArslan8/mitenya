import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateSameOrigin, validateCsrfToken } from '@/lib/api/security';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { reserveCheckoutStock } from '@/lib/inventory/stockReservationService';

type PayTRTokenRequest = {
  checkoutSessionId: string;
};

type PayTRResponse = {
  status: 'success' | 'failed';
  token?: string;
  reason?: string;
};

const MAX_ATTEMPTS_PER_SESSION = 3;

const normalizeText = (value: unknown, maxLength: number, fallback = '') => {
  const raw = String(value ?? fallback).trim();
  if (!raw) return fallback;
  return raw.slice(0, maxLength);
};

const toPaytrMerchantOid = (value: string) => {
  const sanitized = value.replace(/[^A-Za-z0-9]/g, '');
  return sanitized.slice(0, 64);
};

const parseJsonIfNeeded = <T>(value: unknown): T | null => {
  if (!value) return null;
  if (typeof value === 'object') return value as T;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const withQueryParams = (baseUrl: string, params: Record<string, string>) => {
  try {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  } catch {
    return baseUrl;
  }
};

export const POST = async (req: NextRequest) => {
  const csrfError = validateSameOrigin(req);
  if (csrfError) return csrfError;

  const csrfTokenError = validateCsrfToken(req);
  if (csrfTokenError) return csrfTokenError;

  const userIp = getClientIp(req);
  if (!(await rateLimit(`paytr_token:${userIp}`))) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: PayTRTokenRequest;
  try {
    body = (await req.json()) as PayTRTokenRequest;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body?.checkoutSessionId) {
    return NextResponse.json({ ok: false, error: 'checkoutSessionId is required' }, { status: 400 });
  }

  const { data: checkoutSession, error: sessionError } = await supabaseAdmin
    .from('checkout_sessions')
    .select('*')
    .eq('id', body.checkoutSessionId)
    .single();

  if (sessionError || !checkoutSession) {
    return NextResponse.json({ ok: false, error: 'Checkout session not found' }, { status: 404 });
  }

  const isOwner =
    checkoutSession.user_id === user.id ||
    (!!checkoutSession.user_email &&
      !!user.email &&
      String(checkoutSession.user_email).toLowerCase() === String(user.email).toLowerCase());

  if (!isOwner) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  if (checkoutSession.status === 'completed' || checkoutSession.order_id) {
    return NextResponse.json({ ok: false, error: 'Bu checkout tamamlanmış' }, { status: 409 });
  }

  const allowedStatuses = new Set(['active', 'payment_initiated']);
  if (!allowedStatuses.has(String(checkoutSession.status || ''))) {
    return NextResponse.json(
      { ok: false, error: 'Bu checkout için yeni ödeme başlatılamaz' },
      { status: 409 }
    );
  }

  const expiresAt = checkoutSession.expires_at ? new Date(checkoutSession.expires_at).getTime() : NaN;
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    await supabaseAdmin
      .from('checkout_sessions')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', checkoutSession.id)
      .neq('status', 'completed');

    return NextResponse.json({ ok: false, error: 'Checkout süresi dolmuş' }, { status: 410 });
  }

  if (String(checkoutSession.payment_method || '').toLowerCase() !== 'paytr') {
    return NextResponse.json({ ok: false, error: 'Checkout payment method is not PayTR' }, { status: 400 });
  }

  const { count: attemptCount } = await supabaseAdmin
    .from('payment_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('checkout_session_id', checkoutSession.id);

  if ((attemptCount || 0) >= MAX_ATTEMPTS_PER_SESSION) {
    return NextResponse.json(
      { ok: false, error: 'Bu checkout için maksimum ödeme deneme sayısına ulaşıldı' },
      { status: 409 }
    );
  }

  // Prevent double-charge risk: do not create a new attempt while one is still in-flight.
  const { data: inFlightAttempt } = await supabaseAdmin
    .from('payment_attempts')
    .select('id, provider_attempt_id, created_at')
    .eq('checkout_session_id', checkoutSession.id)
    .eq('provider', 'paytr')
    .eq('status', 'initiated')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (inFlightAttempt) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Devam eden bir ödeme denemesi bulunuyor. Lütfen sonucu bekleyin.',
        inFlightAttemptId: inFlightAttempt.provider_attempt_id,
      },
      { status: 409 }
    );
  }

  const pricing =
    parseJsonIfNeeded<{
      total_amount?: number;
      currency?: string;
    }>(checkoutSession.pricing_snapshot) ?? {};

  const cartItems =
    parseJsonIfNeeded<Array<{ product_id?: string; product_name?: string; price?: number; quantity?: number }>>(
      checkoutSession.cart_snapshot
    ) ?? [];

  if (!cartItems.length) {
    return NextResponse.json({ ok: false, error: 'Checkout cart is empty' }, { status: 400 });
  }

  const reservationItems = cartItems.map((item) => ({
    product_id: String(item.product_id || '').trim(),
    quantity: Number(item.quantity || 0),
  }));

  if (reservationItems.some((item) => !item.product_id || !Number.isFinite(item.quantity) || item.quantity <= 0)) {
    return NextResponse.json({ ok: false, error: 'Checkout cart snapshot is invalid' }, { status: 400 });
  }

  const reservationResult = await reserveCheckoutStock(supabaseAdmin, {
    checkoutSessionId: checkoutSession.id,
    items: reservationItems,
    expiresAt: checkoutSession.expires_at,
  });

  if (!reservationResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: reservationResult.message || 'Stok rezerve edilemedi',
        code: reservationResult.code,
        details: reservationResult.details,
      },
      { status: reservationResult.code === 'insufficient_stock' ? 409 : 500 }
    );
  }

  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchantId || !merchantKey || !merchantSalt) {
    return NextResponse.json({ ok: false, error: 'Missing PayTR env vars' }, { status: 500 });
  }

  const totalAmount = Number(pricing.total_amount || 0);
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return NextResponse.json({ ok: false, error: 'Invalid checkout amount' }, { status: 400 });
  }

  const currencyRaw = normalizeText(pricing.currency, 3, 'TRY').toUpperCase();
  const currency = currencyRaw === 'TRY' ? 'TL' : currencyRaw;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const merchantOkUrlBase = process.env.PAYTR_OK_URL || `${siteUrl}/success`;
  const merchantFailUrl = process.env.PAYTR_FAIL_URL || `${siteUrl}/checkout`;

  const nextAttemptNumber = (attemptCount || 0) + 1;
  const providerAttemptId = toPaytrMerchantOid(
    `${checkoutSession.id.replace(/-/g, '')}A${nextAttemptNumber}`
  );

  const { data: paymentAttempt, error: attemptError } = await supabaseAdmin
    .from('payment_attempts')
    .insert({
      checkout_session_id: checkoutSession.id,
      provider: 'paytr',
      provider_attempt_id: providerAttemptId,
      status: 'initiated',
      amount: totalAmount,
      currency: currencyRaw,
      raw_payload: {
        source: 'paytr/get-token',
      },
    })
    .select('id, provider_attempt_id')
    .single();

  if (attemptError || !paymentAttempt) {
    if (attemptError?.code === '23505') {
      return NextResponse.json(
        { ok: false, error: 'Devam eden bir ödeme denemesi bulundu. Lütfen sonucu bekleyin.' },
        { status: 409 }
      );
    }
    console.error('payment attempt create error', attemptError);
    return NextResponse.json({ ok: false, error: 'Payment attempt oluşturulamadı' }, { status: 500 });
  }

  const successToken = normalizeText(checkoutSession.success_token, 128, '');
  const merchantOkUrl = withQueryParams(merchantOkUrlBase, {
    t: successToken,
    sid: checkoutSession.id,
  });

  const shippingAddress =
    parseJsonIfNeeded<{
      contactName?: string;
      line1?: string;
      line2?: string;
      city?: string;
      district?: string;
      postalCode?: string;
      phone?: string;
    }>(checkoutSession.shipping_address_snapshot) ?? {};

  const email = normalizeText(checkoutSession.user_email || user.email, 100, user.email || '');
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Missing user email' }, { status: 400 });
  }

  const paymentAmount = String(Math.round(totalAmount * 100));
  const noInstallment = process.env.PAYTR_NO_INSTALLMENT === '1' ? '1' : '0';
  const maxInstallment = normalizeText(process.env.PAYTR_MAX_INSTALLMENT, 2, '0');
  const testMode = process.env.PAYTR_TEST_MODE ?? (process.env.NODE_ENV === 'production' ? '0' : '1');
  const debugOn = process.env.PAYTR_DEBUG_ON ?? (process.env.NODE_ENV === 'production' ? '0' : '1');
  const timeoutLimit = normalizeText(process.env.PAYTR_TIMEOUT_LIMIT, 3, '30');
  const lang = normalizeText(process.env.PAYTR_LANG, 2, 'tr');

  const basket = cartItems.map((item) => [
    normalizeText(item.product_name, 100, 'Urun'),
    Number(item.price || 0).toFixed(2),
    Number(item.quantity || 1),
  ]);

  const userBasket = Buffer.from(JSON.stringify(basket)).toString('base64');
  const requestIp = normalizeText(userIp, 39, '127.0.0.1');
  const userName = normalizeText(
    shippingAddress.contactName,
    60,
    user.user_metadata?.full_name || user.email || 'Musteri'
  );
  const userAddress = normalizeText(
    [
      shippingAddress.line1,
      shippingAddress.line2,
      shippingAddress.district,
      shippingAddress.city,
      shippingAddress.postalCode,
    ]
      .filter(Boolean)
      .join(', '),
    400,
    'Adres bilgisi yok'
  );
  const userPhone = normalizeText(shippingAddress.phone, 20, '0000000000');

  const hashStr = `${merchantId}${requestIp}${paymentAttempt.provider_attempt_id}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
  const paytrToken = crypto
    .createHmac('sha256', merchantKey)
    .update(`${hashStr}${merchantSalt}`)
    .digest('base64');

  const requestBody = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: requestIp,
    merchant_oid: paymentAttempt.provider_attempt_id,
    email,
    payment_amount: paymentAmount,
    currency,
    user_basket: userBasket,
    no_installment: noInstallment,
    max_installment: maxInstallment,
    paytr_token: paytrToken,
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: merchantOkUrl,
    merchant_fail_url: merchantFailUrl,
    test_mode: testMode,
    debug_on: debugOn,
    timeout_limit: timeoutLimit,
    lang,
  });

  await supabaseAdmin
    .from('checkout_sessions')
    .update({ status: 'payment_initiated', updated_at: new Date().toISOString() })
    .eq('id', checkoutSession.id)
    .neq('status', 'completed');

  try {
    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: requestBody.toString(),
    });

    const data = (await paytrResponse.json()) as PayTRResponse;

    if (!paytrResponse.ok || data.status !== 'success' || !data.token) {
      await supabaseAdmin
        .from('payment_attempts')
        .update({
          status: 'failed',
          error_message: data.reason || 'PayTR token request failed',
          updated_at: new Date().toISOString(),
          raw_payload: {
            request: Object.fromEntries(requestBody.entries()),
            response: data,
          },
        })
        .eq('id', paymentAttempt.id);

      return NextResponse.json(
        {
          ok: false,
          error: data.reason || 'PayTR token request failed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, token: data.token, checkoutSessionId: checkoutSession.id },
      { status: 200 }
    );
  } catch (error) {
    await supabaseAdmin
      .from('payment_attempts')
      .update({
        status: 'failed',
        error_message: 'Internal server error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentAttempt.id);

    console.error('[paytr/get-token] error', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
