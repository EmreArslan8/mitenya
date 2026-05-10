import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';

const lookupSchema = z.object({
  orderNumber: z.string().trim().min(3).max(64),
  email: z.string().trim().email().max(254),
});

const normalizeStatus = (status: unknown) => {
  const normalized = String(status ?? '').toLowerCase();
  if (['processing', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(normalized)) {
    return normalized;
  }
  return 'processing';
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

const buildGuestOrderResponse = async (order: {
  id: string;
  order_number: string | null;
  user_email: string | null;
  status: string | null;
  payment_status: string | null;
  total_amount: number | string | null;
  currency: string | null;
  created_at: string;
  tracking_number?: string | null;
  guest_tracking_token?: string | null;
  metadata?: unknown;
}) => {
  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('product_name, quantity, price, image_url')
    .eq('order_id', order.id)
    .limit(8);

  const metadata = parseJsonIfNeeded<Record<string, unknown>>(order.metadata) ?? {};

  return {
    order: {
      id: order.id,
      order_number: order.order_number,
      status: normalizeStatus(order.status),
      payment_status: order.payment_status,
      total_amount: Number(order.total_amount || 0),
      currency: order.currency || 'TRY',
      created_at: order.created_at,
      tracking_number: order.tracking_number ?? null,
      guest_tracking_token: order.guest_tracking_token ?? metadata.guest_tracking_token ?? null,
      item_count: (items || []).reduce((acc, item) => acc + Number(item.quantity || 1), 0),
      items: (items || []).slice(0, 3).map((item) => ({
        product_name: item.product_name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        image_url: item.image_url,
      })),
    },
  };
};

export async function GET(req: NextRequest) {
  const caller = getClientIp(req);
  if (!(await rateLimit(`guest_order_get:${caller}`))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const token = new URL(req.url).searchParams.get('t')?.trim();
  if (!token || token.length < 32 || token.length > 128) {
    return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
  }

  let { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, user_email, status, payment_status, total_amount, currency, created_at, tracking_number, guest_tracking_token, metadata')
    .eq('guest_tracking_token', token)
    .maybeSingle();

  if (!order && !error) {
    const fallback = await supabaseAdmin
      .from('orders')
      .select('id, order_number, user_email, status, payment_status, total_amount, currency, created_at, tracking_number, guest_tracking_token, metadata')
      .eq('metadata->>guest_tracking_token', token)
      .maybeSingle();
    order = fallback.data;
    error = fallback.error;
  }

  if (error || !order) {
    return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(await buildGuestOrderResponse(order));
}

export async function POST(req: NextRequest) {
  const caller = getClientIp(req);
  if (!(await rateLimit(`guest_order_lookup:${caller}`))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Sipariş no ve e-posta gerekli' }, { status: 400 });
  }

  const { orderNumber, email } = parsed.data;
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, user_email, status, payment_status, total_amount, currency, created_at, tracking_number, guest_tracking_token, metadata')
    .eq('order_number', orderNumber)
    .ilike('user_email', email)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: 'Bu bilgilerle eşleşen sipariş bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(await buildGuestOrderResponse(order));
}

export const dynamic = 'force-dynamic';
