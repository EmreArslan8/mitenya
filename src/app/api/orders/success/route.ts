import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get('t');
    if (!token) {
      return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 });
    }

    const { data: checkoutSession } = await supabaseAdmin
      .from('checkout_sessions')
      .select('id, order_id, success_token_expires_at')
      .eq('success_token', token)
      .single();

    if (checkoutSession) {
      const expiry = checkoutSession.success_token_expires_at
        ? new Date(checkoutSession.success_token_expires_at).getTime()
        : NaN;

      if (!Number.isFinite(expiry) || Date.now() > expiry) {
        return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 });
      }

      if (!checkoutSession.order_id) {
        return NextResponse.json({ processing: true, message: 'Odeme isleniyor' }, { status: 202 });
      }

      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', checkoutSession.order_id)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ processing: true, message: 'Odeme isleniyor' }, { status: 202 });
      }

      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      const shippingAddress = parseJsonIfNeeded(order.shipping_address);

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
    }

    // Backward compatibility: old flow token stored in orders.metadata
    const { data: legacyOrder, error: legacyOrderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('metadata->>success_token', token)
      .single();

    if (legacyOrderError || !legacyOrder) {
      return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 });
    }

    const legacyMeta = parseJsonIfNeeded<Record<string, unknown>>(legacyOrder.metadata) ?? {};
    const legacyExpiresAt = legacyMeta?.success_token_expires_at;
    if (legacyExpiresAt) {
      const expiry = new Date(String(legacyExpiresAt)).getTime();
      if (!Number.isFinite(expiry) || Date.now() > expiry) {
        return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 });
      }
    }

    const { data: legacyItems } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', legacyOrder.id);

    const legacyShippingAddress = parseJsonIfNeeded(legacyOrder.shipping_address);

    return NextResponse.json({
      order: {
        id: legacyOrder.id,
        order_number: legacyOrder.order_number,
        status: legacyOrder.status,
        payment_status: legacyOrder.payment_status,
        payment_method: legacyOrder.payment_method,
        total_amount: parseFloat(legacyOrder.total_amount),
        subtotal: parseFloat(legacyOrder.subtotal || legacyOrder.product_cost || 0),
        shipping_cost: parseFloat(legacyOrder.shipping_cost || 0),
        discount_amount: parseFloat(legacyOrder.discount_amount || 0),
        currency: legacyOrder.currency,
        shipping_address: legacyShippingAddress,
        tracking_number: legacyOrder.tracking_number,
        created_at: legacyOrder.created_at,
        items: legacyItems || [],
      },
    });
  } catch (err) {
    console.error('Order success error:', err);
    return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
  }
}
