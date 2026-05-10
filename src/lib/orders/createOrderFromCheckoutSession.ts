import { createOrderViaEdge } from '@/lib/orders/createOrderViaEdge';
import { generateOrderNumber } from '@/lib/orders/generateOrderNumber';
import { createAffiliateConversion } from '@/lib/affiliates/commissionService';
import { parseCheckoutNotes } from '@/lib/analytics/attribution';
import type { SupabaseClient } from '@supabase/supabase-js';

type SnapshotOrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
  variant_data?: Record<string, string> | null;
  currency?: string;
  total_price?: number;
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

const isJwtLike = (value: string | undefined | null) => {
  const token = String(value || '').trim();
  if (!token) return false;
  return token.split('.').length === 3;
};

const isSupabaseSecretLike = (value: string | undefined | null) => {
  const token = String(value || '').trim();
  if (!token) return false;
  return token.startsWith('sb_secret_');
};

const resolveEdgeAuthToken = () => {
  const explicit = process.env.SUPABASE_EDGE_FUNCTION_JWT;
  if (isJwtLike(explicit) || isSupabaseSecretLike(explicit)) return explicit as string;

  const legacy = process.env.SUPABASE_LEGACY_SERVICE_ROLE_KEY;
  if (isJwtLike(legacy) || isSupabaseSecretLike(legacy)) return legacy as string;

  const current = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (isJwtLike(current) || isSupabaseSecretLike(current)) return current as string;

  return '';
};

const resolveEdgeInternalSecret = () => {
  return String(process.env.EDGE_CREATE_ORDER_INTERNAL_SECRET || '').trim();
};

export async function createOrderFromCheckoutSession(params: {
  supabase: SupabaseClient;
  checkoutSession: {
    id: string;
    user_id: string | null;
    customer_id?: string | null;
    user_email: string;
    payment_method: string;
    notes?: string | null;
    expires_at?: string | null;
    success_token?: string | null;
    success_token_expires_at?: string | null;
    affiliate_code?: string | null;
    cart_snapshot?: unknown;
    pricing_snapshot?: unknown;
    shipping_address_snapshot?: unknown;
    billing_address_snapshot?: unknown;
    discount_snapshot?: unknown;
    consents_snapshot?: unknown;
  };
  merchantOid: string;
  callerIp: string;
  userAgent: string;
}) {
  const { supabase, checkoutSession, merchantOid, callerIp, userAgent } = params;
  const nowIso = new Date().toISOString();

  const cartItems = parseJsonIfNeeded<SnapshotOrderItem[]>(checkoutSession.cart_snapshot) || [];
  const { customerNote, attribution } = parseCheckoutNotes(checkoutSession.notes);
  const pricing =
    parseJsonIfNeeded<{
      subtotal?: number;
      product_cost?: number;
      shipping_cost?: number;
      discount_amount?: number;
      total_amount?: number;
      currency?: string;
    }>(checkoutSession.pricing_snapshot) || {};

  const shippingAddress = parseJsonIfNeeded<Record<string, unknown>>(checkoutSession.shipping_address_snapshot);
  const billingAddress = parseJsonIfNeeded<Record<string, unknown>>(checkoutSession.billing_address_snapshot);
  const discountSnapshot =
    parseJsonIfNeeded<{
      code?: string | null;
      amount?: number;
    }>(checkoutSession.discount_snapshot) || {};

  const consents =
    parseJsonIfNeeded<{
      pre_info_accepted?: boolean;
      distance_sale_accepted?: boolean;
      pre_info_html?: string;
      distance_sale_html?: string;
    }>(checkoutSession.consents_snapshot) || null;

  if (!cartItems.length || !shippingAddress || !checkoutSession.user_email) {
    return { ok: false as const, error: 'Checkout snapshot invalid' };
  }

  const isLateSuccess =
    !!checkoutSession.expires_at &&
    Number.isFinite(new Date(checkoutSession.expires_at).getTime()) &&
    Date.now() > new Date(checkoutSession.expires_at).getTime();

  const documents = consents
    ? [
        {
          doc_type: 'pre_info',
          doc_version: '1.0',
          content_html: consents.pre_info_html,
        },
        {
          doc_type: 'distance_sale',
          doc_version: '1.0',
          content_html: consents.distance_sale_html,
        },
      ]
    : null;

  const consentsRows = consents
    ? [
        {
          doc_type: 'pre_info',
          doc_version: '1.0',
          accepted_at: nowIso,
          ip: callerIp,
          user_agent: userAgent,
          user_id: checkoutSession.user_id,
          customer_id: checkoutSession.customer_id ?? null,
          user_email: checkoutSession.user_email,
        },
        {
          doc_type: 'distance_sale',
          doc_version: '1.0',
          accepted_at: nowIso,
          ip: callerIp,
          user_agent: userAgent,
          user_id: checkoutSession.user_id,
          customer_id: checkoutSession.customer_id ?? null,
          user_email: checkoutSession.user_email,
        },
      ]
    : null;

  const orderNumber = await generateOrderNumber();
  const eventDescription = isLateSuccess
    ? 'PayTR ödemesi başarıyla alındı (late success). Sipariş oluşturuldu.'
    : 'PayTR ödemesi başarıyla alındı. Sipariş oluşturuldu.';

  const payload = {
    order_number: orderNumber,
    user_id: checkoutSession.user_id,
    customer_id: checkoutSession.customer_id ?? null,
    user_email: checkoutSession.user_email,
    payment_status: 'paid',
    payment_method: checkoutSession.payment_method,
    currency: pricing.currency ?? 'TRY',
    subtotal: Number(pricing.subtotal ?? pricing.product_cost ?? 0),
    product_cost: Number(pricing.product_cost ?? pricing.subtotal ?? 0),
    shipping_cost: Number(pricing.shipping_cost ?? 0),
    discount_amount: Number(pricing.discount_amount ?? discountSnapshot.amount ?? 0),
    discount_code: discountSnapshot.code ?? null,
    affiliate_code: checkoutSession.affiliate_code ?? null,
    total_amount: Number(pricing.total_amount ?? 0),
    shipping_address: shippingAddress,
    billing_address: billingAddress ?? null,
    notes: customerNote,
    order_items: cartItems.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image_url,
      variant_data: item.variant_data ?? null,
      currency: item.currency ?? pricing.currency ?? 'TRY',
      total_price: item.total_price ?? item.price * item.quantity,
    })),
    status: 'processing',
    event_status: 'payment_completed',
    event_description: eventDescription,
    documents,
    consents: consentsRows,
    payment_id: merchantOid,
  };

  const edgeAuthToken = resolveEdgeAuthToken();
  const edgeInternalSecret = resolveEdgeInternalSecret();
  if (!edgeAuthToken && !edgeInternalSecret) {
    return {
      ok: false as const,
      error:
        'Missing edge auth. Set SUPABASE_EDGE_FUNCTION_JWT (or SUPABASE_LEGACY_SERVICE_ROLE_KEY / SUPABASE_SERVICE_ROLE_KEY) or EDGE_CREATE_ORDER_INTERNAL_SECRET.',
    };
  }

  const { edgeResponse, edgeData, edgeText } = await createOrderViaEdge(
    payload,
    edgeAuthToken,
    edgeInternalSecret
  );

  if (!edgeResponse.ok || !edgeData?.order) {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('payment_id', merchantOid)
      .eq('payment_method', 'paytr')
      .single();

    if (existingOrder) {
      return {
        ok: true as const,
        order: { id: existingOrder.id, order_number: existingOrder.order_number },
        isLateSuccess,
      };
    }

    return { ok: false as const, error: edgeData?.error || edgeText || 'Order create failed' };
  }

  const createdOrder = edgeData.order;
  const { data: currentOrder } = await supabase
    .from('orders')
    .select('metadata')
    .eq('id', createdOrder.id)
    .maybeSingle();

  const existingMetadata = parseJsonIfNeeded<Record<string, unknown>>(currentOrder?.metadata) || {};

  await supabase
    .from('orders')
    .update({
      metadata: {
        ...existingMetadata,
        checkout_session_id: checkoutSession.id,
        paytr_merchant_oid: merchantOid,
        success_token: checkoutSession.success_token,
        success_token_expires_at: checkoutSession.success_token_expires_at,
        late_success: isLateSuccess,
        attribution: attribution ?? existingMetadata.attribution,
      },
    })
    .eq('id', createdOrder.id);

  if (checkoutSession.affiliate_code) {
    await createAffiliateConversion({
      affiliateCode: checkoutSession.affiliate_code,
      orderId: createdOrder.id,
      orderNumber: createdOrder.order_number,
      orderAmount: Number(pricing.total_amount ?? 0),
      affiliateClickId: attribution?.affiliateClickId ?? null,
    });
  }

  return {
    ok: true as const,
    order: { id: createdOrder.id, order_number: createdOrder.order_number },
    isLateSuccess,
  };
}
