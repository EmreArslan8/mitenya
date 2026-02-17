import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateSameOrigin, validateCsrfToken } from '@/lib/api/security';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';

type PayTRTokenRequest = {
  orderId: string;
};

type PayTRResponse = {
  status: 'success' | 'failed';
  token?: string;
  reason?: string;
};

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

  if (!body?.orderId) {
    return NextResponse.json({ ok: false, error: 'orderId is required' }, { status: 400 });
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    body.orderId
  );

  let orderQuery = supabaseAdmin.from('orders').select('*');
  orderQuery = isUUID ? orderQuery.eq('id', body.orderId) : orderQuery.eq('order_number', body.orderId);

  const { data: order, error: orderError } = await orderQuery.single();
  if (orderError || !order) {
    return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
  }

  const isOwner =
    order.user_id === user.id ||
    (!!order.user_email && !!user.email && String(order.user_email).toLowerCase() === String(user.email).toLowerCase());

  if (!isOwner) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  if (order.payment_method !== 'paytr') {
    return NextResponse.json({ ok: false, error: 'Order payment method is not PayTR' }, { status: 400 });
  }

  // Aynı sipariş için tekrar ödeme başlatmayı engelle.
  if (String(order.payment_status || '').toLowerCase() !== 'pending') {
    return NextResponse.json(
      { ok: false, error: 'Bu sipariş için ödeme tekrar başlatılamaz' },
      { status: 409 }
    );
  }

  const { data: orderItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('product_name, price, quantity')
    .eq('order_id', order.id);

  if (itemsError || !orderItems?.length) {
    return NextResponse.json({ ok: false, error: 'Order items not found' }, { status: 400 });
  }

  const shippingAddress = parseJsonIfNeeded<{
    contactName?: string;
    line1?: string;
    line2?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    phone?: string;
  }>(order.shipping_address);

  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchantId || !merchantKey || !merchantSalt) {
    return NextResponse.json({ ok: false, error: 'Missing PayTR env vars' }, { status: 500 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const merchantOkUrlBase = process.env.PAYTR_OK_URL || `${siteUrl}/success`;
  const merchantFailUrl = process.env.PAYTR_FAIL_URL || `${siteUrl}/checkout`;

  const currencyRaw = normalizeText(order.currency, 3, 'TRY').toUpperCase();
  const currency = currencyRaw === 'TRY' ? 'TL' : currencyRaw;

  const totalAmount = Number(order.total_amount || 0);
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return NextResponse.json({ ok: false, error: 'Invalid order amount' }, { status: 400 });
  }

  const paymentAmount = String(Math.round(totalAmount * 100));
  const noInstallment = process.env.PAYTR_NO_INSTALLMENT === '1' ? '1' : '0';
  const maxInstallment = normalizeText(process.env.PAYTR_MAX_INSTALLMENT, 2, '0');
  const testMode = process.env.PAYTR_TEST_MODE ?? (process.env.NODE_ENV === 'production' ? '0' : '1');
  const debugOn = process.env.PAYTR_DEBUG_ON ?? (process.env.NODE_ENV === 'production' ? '0' : '1');
  const timeoutLimit = normalizeText(process.env.PAYTR_TIMEOUT_LIMIT, 3, '30');
  const lang = normalizeText(process.env.PAYTR_LANG, 2, 'tr');

  const sourceMerchantOid = normalizeText(order.order_number || order.id, 128);
  const merchantOid = toPaytrMerchantOid(sourceMerchantOid);
  if (!merchantOid) {
    return NextResponse.json({ ok: false, error: 'Invalid merchant_oid' }, { status: 400 });
  }

  const orderMeta = parseJsonIfNeeded<Record<string, unknown>>(order.metadata) ?? {};
  const successToken = normalizeText(orderMeta.success_token, 128, '');
  const merchantOkUrl = withQueryParams(merchantOkUrlBase, {
    t: successToken,
  });

  const updatedMeta = {
    ...orderMeta,
    paytr_merchant_oid: merchantOid,
  };
  await supabaseAdmin
    .from('orders')
    .update({ metadata: updatedMeta })
    .eq('id', order.id);

  const email = normalizeText(order.user_email || user.email, 100, user.email || '');
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Missing user email' }, { status: 400 });
  }

  const basket = orderItems.map((item) => [
    normalizeText(item.product_name, 100, 'Urun'),
    Number(item.price || 0).toFixed(2),
    Number(item.quantity || 1),
  ]);

  const userBasket = Buffer.from(JSON.stringify(basket)).toString('base64');
  const requestIp = normalizeText(userIp, 39, '127.0.0.1');
  const userName = normalizeText(shippingAddress?.contactName, 60, user.user_metadata?.full_name || user.email || 'Musteri');
  const userAddress = normalizeText(
    [
      shippingAddress?.line1,
      shippingAddress?.line2,
      shippingAddress?.district,
      shippingAddress?.city,
      shippingAddress?.postalCode,
    ]
      .filter(Boolean)
      .join(', '),
    400,
    'Adres bilgisi yok'
  );
  const userPhone = normalizeText(shippingAddress?.phone, 20, '0000000000');

  const hashStr = `${merchantId}${requestIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
  const paytrToken = crypto
    .createHmac('sha256', merchantKey)
    .update(`${hashStr}${merchantSalt}`)
    .digest('base64');

  const requestBody = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: requestIp,
    merchant_oid: merchantOid,
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

  try {
    const paytrResponse = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: requestBody.toString(),
    });

    const data = (await paytrResponse.json()) as PayTRResponse;

    if (!paytrResponse.ok || data.status !== 'success' || !data.token) {
      return NextResponse.json(
        {
          ok: false,
          error: data.reason || 'PayTR token request failed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, token: data.token }, { status: 200 });
  } catch (error) {
    console.error('[paytr/get-token] error', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
};

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
