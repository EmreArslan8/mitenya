import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: session, error } = await supabaseAdmin
      .from('checkout_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Checkout session bulunamadı' }, { status: 404 });
    }

    const isOwner =
      session.user_id === user.id ||
      (!!session.user_email &&
        !!user.email &&
        String(session.user_email).toLowerCase() === String(user.email).toLowerCase());

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pricing = parseJsonIfNeeded<Record<string, unknown>>(session.pricing_snapshot) ?? {};

    return NextResponse.json({
      session: {
        id: session.id,
        status: String(session.status || ''),
        payment_method: String(session.payment_method || ''),
        expires_at: session.expires_at,
        order_id: session.order_id ?? null,
        order_number: session.order_number ?? null,
        total_amount: Number(pricing.total_amount || 0),
        currency: String(pricing.currency || 'TRY'),
      },
    });
  } catch (err) {
    console.error('checkout session get error', err);
    return NextResponse.json({ error: 'Sunucu hatası oluştu' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
